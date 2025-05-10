<?php

namespace Fraktvalg\Fraktvalg;

use Fraktvalg\Fraktvalg\WooCommerce\Admin\ShippingLabel;
use Fraktvalg\Fraktvalg\WooCommerce\CreateShipment;
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
		new CreateShipment();

		new WooCommerce\Admin\ShippingLabel();
	}

	public function load_plugin_textdomain() {
		\load_plugin_textdomain(
			'fraktvalg',
			false,
			\trailingslashit( FRAKTVALG_BASE_PATH ) . 'languages'
		);
	}

}
