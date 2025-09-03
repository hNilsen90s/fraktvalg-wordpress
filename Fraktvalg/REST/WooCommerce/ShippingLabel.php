<?php

namespace Fraktvalg\Fraktvalg\REST\WooCommerce;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\REST\Base;

class ShippingLabel extends Base {

	protected $permission_role = 'manage_woocommerce';

	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/woocommerce/shipping-label',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'args' => [
					'order_id' => [
						'type' => 'integer',
						'required' => true,
					],
				],
				'callback' => array( $this, 'get_shipping_label' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);
	}

	public function get_shipping_label( \WP_REST_Request $request ) {
		$order = \wc_get_order( $request->get_param( 'order_id' ) );

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

		if ( isset( $labelData->url ) && strpos( $labelData->url, 'data:application/pdf' ) === 0 ) {
			$labelData->url = PdfProxy::generate_pdf_url( $request->get_param( 'order_id' ) );
		}

		return new \WP_REST_Response( $labelData );
	}

}
