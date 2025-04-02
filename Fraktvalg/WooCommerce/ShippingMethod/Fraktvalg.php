<?php

namespace Fraktvalg\Fraktvalg\WooCommerce\ShippingMethod;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\Options;

class Fraktvalg extends \WC_Shipping_Method {

	public function __construct( $instance_id = 0 ) {
		$this->id = 'fraktvalg';
		$this->instance_id = absint( $instance_id );
		$this->method_title = __( 'Fraktvalg', 'fraktvalg' );
		$this->method_description = __( 'Fraktvalg', 'fraktvalg' );
		$this->supports = [
			'shipping-settings',
			'shipping-methods-in-blocks',
		];
	}

	public function calculate_shipping( $package = [] ) {
		// Before trying to calculate shipping, ensure we have a valid shipping address
		if ( empty( $package['destination']['country'] ) || empty( $package['destination']['postcode'] ) ) {
			return;
		}

		// Make sure there are products in the cart before attempting to ask for pricing.
		if ( empty( $package ) ) {
			return;
		}

		$total_weight = 0;
		$total_length = 0;
		$total_width = 0;
		$total_height = 0;
		$total_volume = 0;

		// Get units once before the loop
		$weight_unit = get_option( 'woocommerce_weight_unit' );
		$dimension_unit = get_option( 'woocommerce_dimension_unit' );
		
		// Set up dimension conversion factor
		$dimension_conversion_factor = 1;
		switch ( $dimension_unit ) {
			case 'm':
				$dimension_conversion_factor = 1000;
				break;
			case 'cm':
				$dimension_conversion_factor = 10;
				break;
			case 'in':
				$dimension_conversion_factor = 25.4;
				break;
			case 'yd':
				$dimension_conversion_factor = 914.4;
				break;
			// 'mm' needs no conversion
		}

		foreach ( $package['contents'] as $data ) {
			$product = $data['data'];
			if ( $data['quantity'] < 1 || ! $data['data']->needs_shipping() ) {
				continue;
			}

			// Get the weight and convert to grams
			$product_weight = $product->get_weight();
			if ( $product_weight ) {
				switch ( $weight_unit ) {
					case 'kg':
						$product_weight *= 1000;
						break;
					case 'lbs':
						$product_weight *= 453.59237;
						break;
					case 'oz':
						$product_weight *= 28.3495231;
						break;
					// 'g' needs no conversion
				}
			}

			// Get dimensions and convert to millimeters
			$product_length = $product->get_length();
			$product_width = $product->get_width();
			$product_height = $product->get_height();

			if ( $product_length || $product_width || $product_height ) {
				if ( $product_length ) {
					$product_length *= $dimension_conversion_factor;
				}
				if ( $product_width ) {
					$product_width *= $dimension_conversion_factor;
				}
				if ( $product_height ) {
					$product_height *= $dimension_conversion_factor;
				}
				
				// Recalculate volume if it wasn't explicitly set
				if ( ! $product_volume && $product_length && $product_width && $product_height ) {
					$product_volume = $product_length * $product_width * $product_height;
				}
			}

			if ( $product_weight ) {
				$total_weight += ( (float) $product_weight * $data['quantity'] );
			}
			if ( $product_length && $product_width && $product_height ) {
				$total_length = max( $total_length, (float) $product_length );
				$total_width = max( $total_width, (float) $product_width );
				$total_height = max( $total_height, (float) $product_height );

				$total_volume += ( ( (float) $product_length * (float) $product_width * (float) $product_height ) * $data['quantity'] );
			}
		}

		// Ensure minimum weight of 1g instead of 1kg
		if ( $total_weight < 1 ) {
			$total_weight = 1;
		}

		$shipping_options_array = [
			'sender' => [
				'country'    => \get_option( 'woocommerce_default_country' ),
				'postalCode' => \get_option( 'woocommerce_store_postcode' ),
				'city'       => \get_option( 'woocommerce_store_city' ),
				'address'    => \get_option( 'woocommerce_store_address' ),
			],
			'recipient' => [
				'country'    => $package['destination']['country'] ?? '',
				'postalCode' => $package['destination']['postcode'] ?? '',
				'city'       => $package['destination']['city'] ?? '',
				'address'    => $package['destination']['address'] ?? '',
			],
			'packages' => [
				[
					'packageWeight' => ceil( $total_weight )
				]
			],
		];

		// Add dimensions if they are available
		if ($total_length > 0) {
			$shipping_options_array['packages'][0]['packageLength'] = ceil( $total_length );
		}
		if ($total_width > 0) {
			$shipping_options_array['packages'][0]['packageWidth'] = ceil( $total_width );
		}
		if ($total_height > 0) {
			$shipping_options_array['packages'][0]['packageHeight'] = ceil( $total_height );
		}
		if ($total_volume > 0) {
			$shipping_options_array['packages'][0]['packageVolume'] = ceil( $total_volume );
		}

		$shippers = Api::post(
			'/shipment/offers',
			$shipping_options_array
		);

		$settings        = Options::get();
		$shippingOptions = [];

		if ( ! \is_wp_error( $shippers ) ) {
			$shippingOptions = \json_decode( $shippers['body'] );
			if ( ! is_array( $shippingOptions ) && ! is_object( $shippingOptions ) ) {
				$shippingOptions = [];
			}
		}

		// Check if we're using a block theme
		$is_block_theme = function_exists('wp_is_block_theme') && wp_is_block_theme();

		if ( ! empty( $shippingOptions) ) {
			foreach ( $shippingOptions as $shipper => $options ) {
				foreach ( $options as $count => $option ) {
					$shipping_id = $shipper . ':' . $count;

					$price = $option->price->withVAT;
					if ( isset( $settings['freight']['addedCost'] ) ) {
						if ( ! empty( $settings['freight']['addedCostType'] ) && $settings['freight']['addedCostType'] === 'percent' ) {
							$price += $price * ( $settings['freight']['addedCost'] / 100 );
						} else {
							$price += $settings['freight']['addedCost'];
						}
					}					
					// Set the label based on theme type
					$label = $option->texts->displayName;
					if (!$is_block_theme && isset($option->texts->shipperName)) {
						$label = $option->texts->shipperName . ' - ' . $label;
					}

					$this->add_rate( [
						'id'        => $shipping_id,
						'label'     => $label,
						'cost'      => $price,
						'taxes'     => false,
						'package'   => $package,
						'meta_data' => [
							'fraktvalg' => true,
							'shipper'   => $shipper,
							'option'    => $option,
						],
					] );
				}
			}
		} else {
			// If an error happened when fetching shipping providers, or no options exist, use the fallback shipping option.
			if ( ! empty( $settings['freight'] ) ) {
				if ( 'fixed' === $settings['freight']['custom']['type'] ) {
					$price = $settings['freight']['custom']['price'];
				} else {
					$price = \WC()->cart->get_cart_contents_total() * ( $settings['freight']['custom']['price'] / 100 );
				}

				if ( isset( $settings['freight']['addedCost'] ) ) {
					$price += $settings['freight']['addedCost'];
				}

				$this->add_rate( [
					'id'        => 'fallback',
					'label'     => $settings['freight']['custom']['name'],
					'cost'      => $price,
					'taxes'     => false,
					'package'   => $package,
					'meta_data' => [
						'fraktvalg' => true,
						'shipper'   => 'fallback',
						'option'    => array_merge(
							[
								'delivery' => [
									'estimatedDays' => '3-5',
								],
							],
							$settings['freight']['custom']
						),
					],
				] );
			}
		}
	}

}
