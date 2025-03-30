<?php

namespace Fraktvalg\Fraktvalg;

use Fraktvalg\Fraktvalg\WooCommerce\Admin\ShippingLabel;
use Fraktvalg\Fraktvalg\WooCommerce\CreateShipment;
use Fraktvalg\Fraktvalg\WooCommerce\ShippingMethod;

class Setup {

	public function __construct() {
		new Privacy();
		new WooCommerce\Blocks\Shipping();

		// If Fraktvalg has not been configured yet, do not include any more classes.
		if ( ! \get_option( 'fraktvalg_configured', false ) ) {
			new Onboarding();
			return;
		}

		new Settings();

		new ShippingMethod();
		new CreateShipment();

		new WooCommerce\Admin\ShippingLabel();
	}

}
