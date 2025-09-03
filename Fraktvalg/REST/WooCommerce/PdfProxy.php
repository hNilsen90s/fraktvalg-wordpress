<?php

namespace Fraktvalg\Fraktvalg\REST\WooCommerce;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\REST\Base;

class PdfProxy extends Base {

	protected $permission_role = 'manage_woocommerce';

	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/woocommerce/pdf-proxy/(?P<order_id>\d+)\.pdf',
			[
				'methods' => \WP_REST_Server::READABLE,
				'args' => [
					'order_id' => [
						'type' => 'integer',
						'required' => true,
						'validate_callback' => [ $this, 'validate_order_id' ],
					],
					'token' => [
						'type' => 'string',
						'required' => true,
					],
				],
				'callback' => [ $this, 'serve_pdf' ],
				'permission_callback' => [ $this, 'pdf_permission_callback' ],
			]
		);
	}

	public function validate_order_id( $param, $request, $key ) {
		if ( ! is_numeric( $param ) || $param <= 0 ) {
			return false;
		}

		$order = \wc_get_order( $request->get_param( 'order_id' ) );

		if ( ! $order ) {
			return false;
		}

		return true;
	}

	public function pdf_permission_callback( $request ) {
		$token = $request->get_param( 'token' );
		$order_id = $request->get_param( 'order_id' );

		// Verify token for this specific order
		if ( ! $this->verify_pdf_token( $order_id, $token ) ) {
			return false;
		}

		return true;
	}

	private function verify_pdf_token( $order_id, $token ) {
		$stored_token_data = get_post_meta( $order_id, '_fraktvalg_pdf_token_data', true );

		if ( empty( $stored_token_data ) || ! is_array( $stored_token_data ) ) {
			return false;
		}

		// Check if token matches
		if ( ! hash_equals( $stored_token_data['token'], $token ) ) {
			return false;
		}

		// Check if token has expired
		if ( time() > $stored_token_data['expires'] ) {
			// Clean up expired token
			delete_post_meta( $order_id, '_fraktvalg_pdf_token_data' );
			return false;
		}

		return true;
	}

	public function serve_pdf( \WP_REST_Request $request ) {
		$order_id = $request->get_param( 'order_id' );

		$order = \wc_get_order( $order_id );
		if ( ! $order ) {
			return new \WP_REST_Response( [ 'error' => 'Order not found' ], 404 );
		}

		$shipment_meta = [
			'shipper'       => $order->get_meta( '_fraktvalg_shipper', true ),
			'shipment_id'   => $order->get_meta( '_fraktvalg_shipment_id', true ),
			'shipment_meta' => $order->get_meta( '_fraktvalg_shipment_meta', true ),
		];

		$shippingLabel = Api::post(
			'/shipment/label',
			$shipment_meta
		);

		if ( \is_wp_error( $shippingLabel ) || 200 !== $shippingLabel['response']['code'] ) {
			return new \WP_REST_Response( [ 'error' => 'Failed to get shipping label' ], 500 );
		}

		$labelData = \json_decode( $shippingLabel['body'] ) ?: [];

		// Validate base64 data
		$decoded_pdf = base64_decode( preg_replace( '/^data:.*;base64,/', '', $labelData->url ), true );

		if ( false === $decoded_pdf ) {
			return new \WP_REST_Response( [ 'error' => 'Invalid PDF data' ], 500 );
		}

		// Set appropriate headers for PDF response
		header( 'Content-Type: application/pdf' );
		header( 'Content-Disposition: inline; filename="shipping-label-' . $order_id . '.pdf"' );
		header( 'Content-Length: ' . strlen( $decoded_pdf ) );
		header( 'Cache-Control: private, max-age=0, no-cache, no-store, must-revalidate' );
		header( 'Pragma: no-cache' );

		// Output the PDF
		echo $decoded_pdf;
		exit;
	}

	/**
	 * Generate a URL for serving PDF with token authentication
	 *
	 * @param int $order_id WooCommerce order ID
	 * @param int $expires_in Time in seconds until token expires (default 24 hours)
	 * @return string|false The PDF proxy URL or false on failure
	 */
	public static function generate_pdf_url( $order_id, $expires_in = 300 ) {
		$order = \wc_get_order( $order_id );

		if ( ! $order ) {
			return false;
		}

		// Check if user has permission to generate URL
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return false;
		}

		// Generate cryptographically secure token
		$token = bin2hex( random_bytes( 32 ) );
		$expires = time() + $expires_in;

		// Store token data in order meta
		update_post_meta( $order_id,
			'_fraktvalg_pdf_token_data',
			[
				'token' => $token,
				'expires' => $expires,
				'created' => time(),
				'created_by' => get_current_user_id(),
			]
		);

		// Build the URL with token
		$base_url = rest_url( 'fraktvalg/v1/woocommerce/pdf-proxy/' . $order_id . '.pdf' );

		return add_query_arg( [
			'token' => $token,
		], $base_url );
	}
}
