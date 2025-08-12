<?php

namespace Fraktvalg\Fraktvalg\WooCommerce\Admin\Settings;

class PhoneNumber {

	const OPTION_ID = 'fraktvalg_phone_number';

	public function __construct() {
		\add_filter( 'woocommerce_general_settings', array( $this, 'add_store_phone_setting' ) );
		\add_filter( 'woocommerce_admin_settings_sanitize_option_' . self::OPTION_ID, array( $this, 'sanitize_value' ), 10, 3 );
	}

	public function add_store_phone_setting( $settings ) {
		// Find index of the built-in postcode field.
		$ids = array();
		foreach ( $settings as $row ) {
			$ids[] = isset( $row['id'] ) ? $row['id'] : null;
		}
		$pos = array_search( 'woocommerce_store_postcode', $ids, true );

		$insertion = array(
			array(
				'title'    => \__( 'Phone Number', 'fraktvalg' ),
				'desc'     => \__( 'The phone number for your store, used for shipping and customer service purposes.', 'fraktvalg' ),
				'id'       => self::OPTION_ID,
				'type'     => 'text',
				'default'  => '',
				'desc_tip' => true,
				'autoload' => false,
			),
		);

		// Insert right after postcode if found; otherwise append to the end.
		if ( false === $pos ) {
			return array_merge( $settings, $insertion );
		}

		return array_merge(
			array_slice( $settings, 0, $pos + 1 ),
			$insertion,
			array_slice( $settings, $pos + 1 )
		);
	}

	public function sanitize_value( $value, $option, $raw_value ) {
		$normalized = self::normalize_value( (string) $raw_value );

		if ( '' === $normalized ) {
			if ( \class_exists( '\WC_Admin_Settings' ) ) {
				\WC_Admin_Settings::add_error(
					\esc_html__( 'Fraktvalg phone number must be a valid Norwegian number (8 digits, optionally with +47 or 0047).', 'fraktvalg' )
				);
			}
			$prev = \get_option( self::OPTION_ID, '' );
			return is_string( $prev ) ? $prev : '';
		}

		return $normalized;
	}

	private static function normalize_value( $raw ) {
		// Strip everything that's not a digit.
		$digits = preg_replace( '/\D+/', '', $raw );

		// Handle leading 0047.
		if ( 0 === strpos( $digits, '0047' ) ) {
			$digits = substr( $digits, 4 );
		}

		// Handle leading 47 only if more than 8 digits remain.
		if ( 0 === strpos( $digits, '47' ) && strlen( $digits ) > 8 ) {
			$digits = substr( $digits, 2 );
		}

		// If exactly 8 digits, assume national Norwegian.
		if ( 8 === strlen( $digits ) ) {
			return '+47' . $digits;
		}

		return '';
	}

	public static function get_value() {
		return (string) \get_option( self::OPTION_ID, '' );
	}
}
