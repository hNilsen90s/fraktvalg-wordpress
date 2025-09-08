<?php

namespace Fraktvalg\Fraktvalg;

/**
 * Handles conversion of dimensions and weights to standardized units for API communication.
 * Converts all weights to grams and all dimensions to millimeters.
 */
class DimensionConverter {

	/**
	 * Convert weight from any WooCommerce unit to grams.
	 *
	 * @param float|string|null $value The weight value to convert.
	 * @param string $from_unit The unit to convert from (kg, g, lbs, oz).
	 * @return float The weight in grams.
	 */
	public static function convertWeightToGrams( $value, string $from_unit = 'g' ): float {
		if ( empty( $value ) || ! is_numeric( $value ) ) {
			return 0;
		}

		$value = (float) $value;

		switch ( $from_unit ) {
			case 'kg':
				return $value * 1000;
			case 'lbs':
				return $value * 453.59237;
			case 'oz':
				return $value * 28.3495231;
			case 'g':
			default:
				return $value;
		}
	}

	/**
	 * Convert dimension from any WooCommerce unit to millimeters.
	 *
	 * @param float|string|null $value The dimension value to convert.
	 * @param string $from_unit The unit to convert from (m, cm, mm, in, yd).
	 * @return float The dimension in millimeters.
	 */
	public static function convertDimensionToMillimeters( $value, string $from_unit = 'mm' ): float {
		if ( empty( $value ) || ! is_numeric( $value ) ) {
			return 0;
		}

		$value = (float) $value;

		switch ( $from_unit ) {
			case 'm':
				return $value * 1000;
			case 'cm':
				return $value * 10;
			case 'in':
				return $value * 25.4;
			case 'yd':
				return $value * 914.4;
			case 'mm':
			default:
				return $value;
		}
	}

	/**
	 * Get the dimension conversion factor for a given unit.
	 *
	 * @param string $from_unit The unit to get the conversion factor for.
	 * @return float The conversion factor to multiply by to get millimeters.
	 */
	public static function getDimensionConversionFactor( string $from_unit = 'mm' ): float {
		switch ( $from_unit ) {
			case 'm':
				return 1000;
			case 'cm':
				return 10;
			case 'in':
				return 25.4;
			case 'yd':
				return 914.4;
			case 'mm':
			default:
				return 1;
		}
	}

	/**
	 * Convert a product's dimensions and weight to standardized units.
	 *
	 * @param \WC_Product $product The WooCommerce product.
	 * @param array $default_dimensions Default dimensions to use if product dimensions are not set.
	 * @param string $weight_unit The weight unit used by WooCommerce.
	 * @param string $dimension_unit The dimension unit used by WooCommerce.
	 * @return array Array containing weight (grams), length, width, height (millimeters), and volume (cubic millimeters).
	 */
	public static function convertProductDimensions( 
		\WC_Product $product, 
		array $default_dimensions = [],
		string $weight_unit = 'g',
		string $dimension_unit = 'mm'
	): array {
		// Get product dimensions with defaults
		$weight = $product->get_weight() ?: ( $default_dimensions['weight'] ?? 0 );
		$length = $product->get_length() ?: ( $default_dimensions['length'] ?? 0 );
		$width = $product->get_width() ?: ( $default_dimensions['width'] ?? 0 );
		$height = $product->get_height() ?: ( $default_dimensions['height'] ?? 0 );

		// Convert weight to grams
		$weight_grams = self::convertWeightToGrams( $weight, $weight_unit );

		// Convert dimensions to millimeters
		$length_mm = self::convertDimensionToMillimeters( $length, $dimension_unit );
		$width_mm = self::convertDimensionToMillimeters( $width, $dimension_unit );
		$height_mm = self::convertDimensionToMillimeters( $height, $dimension_unit );

		// Calculate volume if all dimensions are present
		$volume_mm3 = 0;
		if ( $length_mm > 0 && $width_mm > 0 && $height_mm > 0 ) {
			$volume_mm3 = $length_mm * $width_mm * $height_mm;
		}

		return [
			'weight' => $weight_grams,
			'length' => $length_mm,
			'width' => $width_mm,
			'height' => $height_mm,
			'volume' => $volume_mm3,
		];
	}

	/**
	 * Calculate package totals from cart contents or order items.
	 *
	 * @param array $items Cart contents or order items.
	 * @param array $default_dimensions Default dimensions from settings.
	 * @param string $weight_unit The weight unit used by WooCommerce.
	 * @param string $dimension_unit The dimension unit used by WooCommerce.
	 * @param string $item_type Either 'cart' or 'order' to handle different item structures.
	 * @return array Array containing total weight, max dimensions, and total volume.
	 */
	public static function calculatePackageTotals(
		array $items,
		array $default_dimensions = [],
		string $weight_unit = 'g',
		string $dimension_unit = 'mm',
		string $item_type = 'cart'
	): array {
		$total_weight = 0;
		$max_length = 0;
		$max_width = 0;
		$max_height = 0;
		$total_volume = 0;

		foreach ( $items as $item ) {
			// Get product and quantity based on item type
			if ( $item_type === 'cart' ) {
				$product = $item['data'] ?? null;
				$quantity = $item['quantity'] ?? 0;
				
				if ( ! $product || $quantity < 1 || ! $product->needs_shipping() ) {
					continue;
				}
			} else {
				// Order item
				$product = $item->get_product();
				$quantity = $item->get_quantity();
				
				if ( ! $product || $quantity < 1 || ! $product->needs_shipping() ) {
					continue;
				}
			}

			// Convert product dimensions
			$dimensions = self::convertProductDimensions( 
				$product, 
				$default_dimensions, 
				$weight_unit, 
				$dimension_unit 
			);

			// Accumulate totals
			if ( $dimensions['weight'] > 0 ) {
				$total_weight += $dimensions['weight'] * $quantity;
			}

			if ( $dimensions['length'] > 0 && $dimensions['width'] > 0 && $dimensions['height'] > 0 ) {
				$max_length = max( $max_length, $dimensions['length'] );
				$max_width = max( $max_width, $dimensions['width'] );
				$max_height = max( $max_height, $dimensions['height'] );
				$total_volume += $dimensions['volume'] * $quantity;
			}
		}

		// Ensure minimum weight of 1g
		if ( $total_weight < 1 ) {
			$total_weight = 1;
		}

		return [
			'weight' => $total_weight,
			'length' => $max_length,
			'width' => $max_width,
			'height' => $max_height,
			'volume' => $total_volume,
		];
	}

	/**
	 * Prepare package data for API submission.
	 *
	 * @param array $totals Package totals from calculatePackageTotals.
	 * @param bool $round Whether to round values up using ceil().
	 * @return array Package data formatted for API.
	 */
	public static function preparePackageForApi( array $totals, bool $round = true ): array {
		$package = [
			'packageWeight' => $round ? ceil( $totals['weight'] ) : $totals['weight'],
		];

		// Only add dimensions if they are greater than 0
		if ( $totals['length'] > 0 ) {
			$package['packageLength'] = $round ? ceil( $totals['length'] ) : $totals['length'];
		}
		if ( $totals['width'] > 0 ) {
			$package['packageWidth'] = $round ? ceil( $totals['width'] ) : $totals['width'];
		}
		if ( $totals['height'] > 0 ) {
			$package['packageHeight'] = $round ? ceil( $totals['height'] ) : $totals['height'];
		}
		if ( $totals['volume'] > 0 ) {
			$package['packageVolume'] = $round ? ceil( $totals['volume'] ) : $totals['volume'];
		}

		return $package;
	}
}