<?php

namespace Fraktvalg\Fraktvalg\WooCommerce;

use Fraktvalg\Fraktvalg\Api;

class CreateShipment {

	public function __construct() {
		\add_action( 'woocommerce_order_status_processing', [ $this, 'create_shipment' ] );
	}

	public function create_shipment( $order_id ) {
		$order = \wc_get_order( $order_id );
		$shipping_methods = $order->get_shipping_methods();

		foreach ( $shipping_methods as $shipping_method ) {
			// Ignore any shipping method not controlled by our implementations.
			if ( 'fraktvalg' !== $shipping_method->get_method_id() ) {
				continue;
			}

			$total_weight = 0;
			foreach ( $order->get_items() as $item ) {
				$product = $item->get_product();


				if ( $product ) {
					$total_weight += ( (float) $product->get_weight() * $item->get_quantity() );
				}
			}

			$shipping_meta = $shipping_method->get_meta( 'option', true );

			$shipping_options_array = [
				'shipper'   => \wp_json_encode( $shipping_meta ),
				'sender'    => [
					'country'    => \get_option( 'woocommerce_default_country' ),
					'postalCode' => \get_option( 'woocommerce_store_postcode' ),
					'address'	=> \get_option( 'woocommerce_store_address' ),
					'email'		=> \get_option( 'woocommerce_email_from' ),
					'phone'		=> \get_option( 'woocommerce_store_phone' ),
				],
				'recipient' => [
					'country'    => $package['destination']['country'] ?? '',
					'postalCode' => $package['destination']['postcode'] ?? '',
					'city'       => $package['destination']['city'] ?? '',
					'address'    => $package['destination']['address'] ?? '',
					'email'		=> $order->get_billing_email(),
					'phone'		=> $order->get_billing_phone(),
				],
				'packages'  => [
					[
						'packageWeight' => $total_weight
					]
				],
			];

			$shipment = Api::post(
				'/shipment/register',
				$shipping_options_array
			);

			if ( \is_wp_error( $shipment ) || 200 !== $shipment['response']['code'] ) {
				$order->add_order_note(
					\sprintf(
						// translators: 1: Shipping method name, 2: Shipper name, 3: Error message.
						__( 'Fraktvalg: Failed to create shipment with %1$s for %2$s (%3$s)', 'fraktvalg' ),
						$shipping_method->get_name(),
						\ucfirst( $shipping_method->get_meta( 'shipper' ) ),
						( \is_wp_error( $shipment ) ? $shipment->get_error_message() : $shipment['response']['message'] )
					),
					false // Not a customer note.
				);
				continue;
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
		}
	}

}
