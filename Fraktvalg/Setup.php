<?php

namespace Fraktvalg\Fraktvalg;

use Fraktvalg\Fraktvalg\WooCommerce\Admin\ShippingLabel;
use Fraktvalg\Fraktvalg\WooCommerce\ShippingMethod;

class Setup {

	public function __construct() {
		\add_action( 'init', [ $this, 'load_plugin_textdomain' ] );

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

		new WooCommerce\Admin\FilterOrderList();
		new WooCommerce\Admin\ShipmentStatusColumn();
		new WooCommerce\Admin\ShippingLabel();

		new \Fraktvalg\Fraktvalg\REST\WooCommerce\CreateConsignment();
		new \Fraktvalg\Fraktvalg\REST\WooCommerce\ShippingLabel();
	}

	public function load_plugin_textdomain() {
		\load_plugin_textdomain(
			'fraktvalg',
			false,
			\trailingslashit( FRAKTVALG_BASE_PATH ) . 'languages'
		);
	}

}
