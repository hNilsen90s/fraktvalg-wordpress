<?php

namespace Fraktvalg\Fraktvalg;

class Options {

	/**
	 * Retrieve one, or all, options for the plugin.
	 *
	 * @param string $option Optional. The option value to retrieve the value for.
	 *
	 * @return array|mixed
	 */
	public static function get( string $option = '' ) {
		$default_options = [
			'freight' => [
				'addedCost'     => 0,
				'addedCostType' => 'fixed',
				'undersell'     => 0,
				'custom'        => [
					'name'  => '',
					'price' => 0,
					'type'  => 'fixed',
				],
			],
			'useProduction' => wp_get_environment_type() === 'production',
			'names'   => [],
			'default_dimensions' => [
				'length' => null,
				'width' => null,
				'height' => null,
				'weight' => null,
			],
		];

		$options = \get_option( 'fraktvalg_options', [] );

		$options = \array_replace_recursive( $default_options, $options );

		if ( $option ) {
			$keys = explode( '.', $option );
			$value = $options;

			foreach ( $keys as $key ) {
				if ( ! isset( $value[ $key ] ) ) {
					return null;
				}
				$value = $value[ $key ];
			}

			return $value;
		}

		return $options;
	}

	/**
	 * Set an individual option value.
	 *
	 * @param string $option The option key to set.
	 * @param mixed $value The value to set the option to.
	 *
	 * @return bool If the options entry was updated or not.
	 */
	public static function set( string $option, $value ) : bool {
		$options = self::get();

		$options[ $option ] = $value;

		return \update_option( 'fraktvalg_options', $options );
	}

	/**
	 * Bulk update all option entries
	 *
	 * @param array $options An array of the options to update.
	 *
	 * @return bool If the options entry was updated or not.
	 */
	public static function bulk_set( array $options ) : bool {
		$default_options = self::get();

		$options = \array_merge( $default_options, $options );

		return \update_option( 'fraktvalg_options', $options );
	}

	public static function get_cache_timestamp() {
		$timestamp = \get_option( 'fraktvalg_cache_timestamp', false );

		if ( ! $timestamp ) {
			$timestamp = time();
			update_option( 'fraktvalg_cache_timestamp', $timestamp );
		}

		return $timestamp;
	}

	public static function clear_cache_timestamp() {
		return \delete_option( 'fraktvalg_cache_timestamp' );
	}

	/**
	 * Clear all shipping-related transient cache
	 * This ensures fresh data is fetched from the API
	 *
	 * @return int Number of deleted transients
	 */
	public static function clear_shipping_cache() {
		global $wpdb;
		
		// Clear all fraktvalg shipping transients (both success and error caches)
		$deleted = $wpdb->query(
			"DELETE FROM {$wpdb->options} 
			 WHERE option_name LIKE '_transient_fraktvalg_shipping_options_%' 
			 OR option_name LIKE '_transient_timeout_fraktvalg_shipping_options_%'
			 OR option_name LIKE '_transient_error_fraktvalg_shipping_options_%'
			 OR option_name LIKE '_transient_timeout_error_fraktvalg_shipping_options_%'"
		);
		
		// Also clear the cache timestamp to force refresh
		self::clear_cache_timestamp();
		
		return $deleted;
	}

}
