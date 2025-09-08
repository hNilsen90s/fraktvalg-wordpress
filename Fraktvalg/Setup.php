<?php

namespace Fraktvalg\Fraktvalg;

use Fraktvalg\Fraktvalg\WooCommerce\ShippingMethod;

class Setup {

	public function __construct() {
		\add_action( 'init', [ $this, 'load_plugin_textdomain' ] );
		\add_action( 'wp_enqueue_scripts', [ $this, 'load_block_translations' ] );
		\add_action( 'enqueue_block_editor_assets', [ $this, 'load_block_translations' ] );

		// Hook into WooCommerce shipping events to clear cache when needed
		\add_action( 'woocommerce_shipping_zone_method_added', [ $this, 'clear_shipping_cache' ] );
		\add_action( 'woocommerce_shipping_zone_method_deleted', [ $this, 'clear_shipping_cache' ] );
		\add_action( 'woocommerce_shipping_zone_method_status_toggled', [ $this, 'clear_shipping_cache' ] );
		\add_action( 'woocommerce_shipping_zone_updated', [ $this, 'clear_shipping_cache' ] );
		\add_action( 'update_option_fraktvalg_options', [ $this, 'clear_shipping_cache' ] );
		\add_action( 'update_option_fraktvalg_api_key', [ $this, 'clear_shipping_cache' ] );

		new Privacy();
		new WooCommerce\Blocks\Shipping();

		// If Fraktvalg has not been configured yet, do not include any more classes.
		if ( ! \get_option( 'fraktvalg_configured', false ) ) {
			new Onboarding();
			return;
		}

		new Settings();
		new PluginControls();

		new ShippingMethod();

		new WooCommerce\Admin\Settings\PhoneNumber();
		new WooCommerce\Admin\FilterOrderList();
		new WooCommerce\Admin\ShipmentStatusColumn();
		new WooCommerce\Admin\ShippingLabel();

		new \Fraktvalg\Fraktvalg\REST\WooCommerce\CreateConsignment();
		new \Fraktvalg\Fraktvalg\REST\WooCommerce\ShippingLabel();
		new \Fraktvalg\Fraktvalg\REST\WooCommerce\PdfProxy();
	}

	public function load_plugin_textdomain() {
		\load_plugin_textdomain(
			'fraktvalg',
			false,
			\trailingslashit( \dirname( \plugin_basename( FRAKTVALG_BASE_FILE ) ) ) . 'languages'
		);
	}

	public function load_block_translations() {
		$script_handle = 'fraktvalg-shipping-selector-view-script';

		\wp_set_script_translations(
			$script_handle,
			'fraktvalg',
			\trailingslashit( FRAKTVALG_BASE_PATH ) . 'languages'
		);
	}

	/**
	 * Clear shipping cache when relevant settings change
	 * This ensures fresh shipping rates are fetched from the API
	 */
	public function clear_shipping_cache() {
		Options::clear_shipping_cache();
	}

}
