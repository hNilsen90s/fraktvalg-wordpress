<?php

namespace Fraktvalg\Fraktvalg\REST\WooCommerce;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\DimensionConverter;
use Fraktvalg\Fraktvalg\REST\Base;
use Fraktvalg\Fraktvalg\WooCommerce\Admin\Settings\PhoneNumber;

class CreateConsignment extends Base {

	protected $permission_role = 'manage_woocommerce';

	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/woocommerce/create-consignment',
			[
				'methods' => \WP_REST_Server::EDITABLE,
				'args' => [
					'order_id' => [
						'type' => 'integer',
						'required' => true,
					],
				],
				'callback' => array( $this, 'create_shipment' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);
	}

	public function create_shipment( \WP_REST_Request $request ) {
		$order = \wc_get_order( $request->get_param( 'order_id' ) );
		$shipping_methods = $order->get_shipping_methods();

		foreach ( $shipping_methods as $shipping_method ) {
			// Get WooCommerce units
			$weight_unit = get_option( 'woocommerce_weight_unit' );
			$dimension_unit = get_option( 'woocommerce_dimension_unit' );

			// Calculate package totals using the centralized converter
			// Note: CreateConsignment doesn't use default dimensions (only actual product dimensions)
			$package_totals = DimensionConverter::calculatePackageTotals(
				$order->get_items(),
				[], // No default dimensions for consignment creation
				$weight_unit,
				$dimension_unit,
				'order'
			);

			// Prepare package data for API submission
			$package_data = DimensionConverter::preparePackageForApi( $package_totals );

			$shipping_meta = $shipping_method->get_meta( 'option', true );
			$shipping_meta->id = $shipping_method->get_meta( 'shipper' );

			$shipping_options_array = [
				'shipper'   => \wp_json_encode( $shipping_meta ),
				'sender'    => [
					'name'       => \get_bloginfo( 'name' ),
					'country'    => \get_option( 'woocommerce_default_country' ),
					'postalCode' => \get_option( 'woocommerce_store_postcode' ),
					'city'       => \get_option( 'woocommerce_store_city' ),
					'address'    => \get_option( 'woocommerce_store_address' ),
					'email'      => \get_option( 'woocommerce_email_from_address', null ),
					'phone'      => PhoneNumber::get_value(),
				],
				'recipient' => [
					'name'       => trim( $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name() ),
					'country'    => $order->get_shipping_country(),
					'postalCode' => $order->get_shipping_postcode(),
					'city'       => $order->get_shipping_city(),
					'address'    => $order->get_shipping_address_1(),
					'email'		=> $order->get_billing_email(),
					'phone'		=> $order->get_billing_phone(),
				],
				'packages'  => [ $package_data ],
			];

			$shipment = Api::post(
				'/shipment/register',
				$shipping_options_array
			);

			if ( \is_wp_error( $shipment ) || 200 !== $shipment['response']['code'] ) {
				$error_message = \is_wp_error( $shipment ) ? $shipment->get_error_message() : $shipment['response']['message'];

				$order->add_order_note(
					\sprintf(
						// translators: 1: Shipping method name, 2: Shipper name, 3: Error message.
						__( 'Fraktvalg: Failed to create shipment with %1$s for %2$s (%3$s)', 'fraktvalg' ),
						$shipping_method->get_name(),
						\ucfirst( $shipping_method->get_meta( 'shipper' ) ),
						$error_message
					),
					false // Not a customer note.
				);

				return new \WP_REST_Response([
					'success' => false,
					'error' => $error_message,
					'shippingMethod' => $shipping_method->get_name(),
					'shipper' => $shipping_method->get_meta( 'shipper' )
				], 400);
			}

			$shipment = \json_decode( $shipment['body'] );

			// Individually store the shipment ID separate from the full shipment metadata for more performant lookups.
			$order->update_meta_data( '_fraktvalg_shipper', $shipping_method->get_meta( 'shipper' ) );
			$order->update_meta_data( '_fraktvalg_shipment_id', $shipment->shipmentId );
			$order->update_meta_data( '_fraktvalg_shipment_meta', \wp_json_encode( $shipment ) );

			$order->add_order_note(
				\sprintf(
					// translators: 1: Shipping method name, 2: Shipper name, 3: Shipment ID.
					__( 'Fraktvalg: Shipment created with %1$s for %2$s and has been assigned shipment ID %3$s', 'fraktvalg' ),
					$shipping_method->get_name(),
					\ucfirst( $shipping_method->get_meta( 'shipper' ) ),
					$shipment->shipmentId
				),
				false // Not a customer note.
			);

			$order->save();

			// Return success response with shipment data
			return new \WP_REST_Response([
				'success' => true,
				'data' => [
					'shipmentId' => $shipment->shipmentId,
					'shipper' => $shipping_method->get_meta( 'shipper' ),
					'shippingMethod' => $shipping_method->get_name(),
					'meta' => $shipment
				]
			], 200);
		}

		// If we get here, no valid shipping methods were found
		return new \WP_REST_Response([
			'success' => false,
			'error' => __( 'No valid Fraktvalg shipping methods found for this order.', 'fraktvalg' )
		], 400);
	}

}
