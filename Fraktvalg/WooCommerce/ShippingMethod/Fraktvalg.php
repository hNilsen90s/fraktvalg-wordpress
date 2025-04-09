<?php

namespace Fraktvalg\Fraktvalg\WooCommerce\ShippingMethod;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\Options;

class Fraktvalg extends \WC_Shipping_Method {

	/**
	 * Stores the cheapest shipping option ID
	 *
	 * @var string|null
	 */
	private $cheapest_shipping_id = null;

	/**
	 * Stores the cheapest shipping price
	 *
	 * @var float|null
	 */
	private $cheapest_shipping_price = null;

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
			$product_volume = 0;

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
				if ( $product_length && $product_width && $product_height ) {
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
		$priorityProvider = \get_option( "fraktvalg['priorityProvider']", [ 'providerId' => '', 'discount' => 0, 'discountType' => 'percent' ] );

		if ( ! \is_wp_error( $shippers ) && 200 === $shippers['response']['code'] ) {
			$shippingOptions = \json_decode( $shippers['body'] );
			if ( ! is_array( $shippingOptions ) && ! is_object( $shippingOptions ) ) {
				$shippingOptions = [];
			}
		}

		// Check if we're using a block theme
		$is_block_theme = function_exists('wp_is_block_theme') && wp_is_block_theme();

		// Reset cheapest shipping variables
		$this->cheapest_shipping_id = null;
		$this->cheapest_shipping_price = null;

		if ( ! empty( $shippingOptions) ) {
			// Find the cheapest shipping method from non-priority providers
			$cheapest_price = $this->get_cheapest_shipping_price( $shippingOptions, $priorityProvider['providerId'], $settings );
			
			// First, add the priority provider if it exists
			if ( ! empty( $priorityProvider['providerId'] ) && isset( $shippingOptions->{$priorityProvider['providerId']} ) ) {
				foreach ( $shippingOptions->{$priorityProvider['providerId']} as $count => $option ) {
					$shipping_id = $priorityProvider['providerId'] . ':' . $count;

					$price = $option->price->withVAT;
					
					// Apply priority provider discount if set and if priority provider is more expensive than cheapest option
					if ( ! empty( $priorityProvider['discount'] ) && $price > $cheapest_price ) {
						// Calculate the discount amount needed to match or beat the cheapest price
						$discount_amount = $price - $cheapest_price;
						
						// Apply the configured discount type and amount
						if ( 'percent' === $priorityProvider['discountType'] ) {
							// Calculate what percentage discount would be needed to match the cheapest price
							$needed_percent_discount = ( $discount_amount / $price ) * 100;
							
							// Apply the configured discount, but not more than needed to match the cheapest price
							$applied_percent_discount = min( $priorityProvider['discount'], $needed_percent_discount );
							$price = $price * ( 1 - ( $applied_percent_discount / 100 ) );
						} else {
							// Apply the configured fixed discount, but not more than needed to match the cheapest price
							$applied_fixed_discount = min( $priorityProvider['discount'], $discount_amount );
							$price = $price - $applied_fixed_discount;
						}
					}
					
					// Apply added cost from settings
					if ( isset( $settings['freight']['addedCost'] ) ) {
						if ( ! empty( $settings['freight']['addedCostType'] ) && 'percent' === $settings['freight']['addedCostType'] ) {
							$price += $price * ( $settings['freight']['addedCost'] / 100 );
						} else {
							$price += $settings['freight']['addedCost'];
						}
					}				
					
					// Always round up the price to the next full number.
					$price = ceil( $price );
					
					// Set the label based on theme type
					$label = $option->texts->shipperName . ' - ' . $label;

					if ( isset( $option->texts->description ) ) {
						$label .= ' (' . $option->texts->description . ')';
					}

					$this->add_shipping_rate( $shipping_id, $label, $price, $package, [
						'fraktvalg' => true,
						'shipper'   => $priorityProvider['providerId'],
						'option'    => $option,
						'priority'  => true,
					] );

					// Track the cheapest priority shipping option
					if ( null === $this->cheapest_shipping_price || $price < $this->cheapest_shipping_price ) {
						$this->cheapest_shipping_price = $price;
						$this->cheapest_shipping_id = $shipping_id;
					}
				}
			}

			// Then add all other providers
			foreach ( $shippingOptions as $shipper => $options ) {
				// Skip the priority provider as it's already been added
				if ( $shipper === $priorityProvider['providerId'] ) {
					continue;
				}

				foreach ( $options as $count => $option ) {
					$shipping_id = $shipper . ':' . $count;

					$price = $option->price->withVAT;
					if ( isset( $settings['freight']['addedCost'] ) ) {
						if ( ! empty( $settings['freight']['addedCostType'] ) && 'percent' === $settings['freight']['addedCostType'] ) {
							$price += $price * ( $settings['freight']['addedCost'] / 100 );
						} else {
							$price += $settings['freight']['addedCost'];
						}
					}					
					// Set the label based on theme type
					$label = $option->texts->displayName;
					if ( ! $is_block_theme && isset( $option->texts->shipperName ) ) {
						$label = $option->texts->shipperName . ' - ' . $label;

						if ( isset( $option->texts->description ) ) {
							$label .= ' (' . $option->texts->description . ')';
						}
					}

					$this->add_shipping_rate( $shipping_id, $label, $price, $package, [
						'fraktvalg' => true,
						'shipper'   => $shipper,
						'option'    => $option,
					] );

					// Track the cheapest non-priority shipping option
					// Only update if no priority provider exists or if this is cheaper than the cheapest priority option
					if ( empty( $priorityProvider['providerId'] ) || null === $this->cheapest_shipping_price || $price < $this->cheapest_shipping_price ) {
						$this->cheapest_shipping_price = $price;
						$this->cheapest_shipping_id = $shipping_id;
					}
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

				$this->add_shipping_rate( 'fallback', $settings['freight']['custom']['name'], $price, $package, [
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
				] );

				// Set fallback as cheapest option if no other options exist
				$this->cheapest_shipping_price = $price;
				$this->cheapest_shipping_id = 'fallback';
			}
		}

		// Set the default shipping option in WooCommerce
		if ( ! empty( $this->cheapest_shipping_id ) ) {
			// Check if a shipping method is already chosen
			$chosen_shipping_methods = \WC()->session->get( 'chosen_shipping_methods' );
			
			// Only set the default if no shipping method is chosen
			if ( empty( $chosen_shipping_methods ) || ! is_array( $chosen_shipping_methods ) || empty( $chosen_shipping_methods[0] ) ) {
				// Set the default shipping option in WooCommerce
				\WC()->session->set( 'chosen_shipping_methods', [ $this->cheapest_shipping_id ] );
			}
		}
	}

	/**
	 * Add a shipping rate to WooCommerce
	 *
	 * @param string $shipping_id The shipping ID
	 * @param string $label The shipping label
	 * @param float  $price The shipping price
	 * @param array  $package The package data
	 * @param array  $meta_data Additional meta data for the shipping rate
	 * @return void
	 */
	private function add_shipping_rate( $shipping_id, $label, $price, $package, $meta_data ) {
		$this->add_rate( [
			'id'        => $shipping_id,
			'label'     => $label,
			'cost'      => $price,
			'taxes'     => false,
			'package'   => $package,
			'meta_data' => $meta_data,
		] );
	}

	/**
	 * Find the cheapest shipping price from non-priority providers
	 *
	 * @param object $shipping_options The shipping options returned from the API
	 * @param string $priority_provider_id The ID of the priority provider to exclude
	 * @param array  $settings The plugin settings
	 * @return float|null The cheapest shipping price found
	 */
	private function get_cheapest_shipping_price( $shipping_options, $priority_provider_id, $settings ) {
		$cheapest_price = null;
		$has_other_providers = false;
		
		// Loop through all providers to find the cheapest price
		foreach ( $shipping_options as $shipper => $options ) {
			// Skip the priority provider
			if ( $shipper === $priority_provider_id ) {
				continue;
			}
			
			$has_other_providers = true;
			
			foreach ( $options as $option ) {
				$price = $option->price->withVAT;
				
				// Apply added cost from settings
				if ( isset( $settings['freight']['addedCost'] ) ) {
					if ( ! empty( $settings['freight']['addedCostType'] ) && 'percent' === $settings['freight']['addedCostType'] ) {
						$price += $price * ( $settings['freight']['addedCost'] / 100 );
					} else {
						$price += $settings['freight']['addedCost'];
					}
				}
				
				if ( null === $cheapest_price || $price < $cheapest_price ) {
					$cheapest_price = $price;
				}
			}
		}
		
		// If no other providers exist, set cheapest price to 0 to avoid applying discount
		if ( ! $has_other_providers ) {
			$cheapest_price = 0;
		}
		
		return $cheapest_price;
	}

}
