<?php

namespace Fraktvalg\Fraktvalg;

use Fraktvalg\Fraktvalg\WooCommerce\Admin\ShippingLabel;
use Fraktvalg\Fraktvalg\WooCommerce\CreateShipment;
use Fraktvalg\Fraktvalg\WooCommerce\ShippingMethod;

class Setup {

	public function __construct() {
		if ( ! \get_option( 'fraktvalg_configured', false ) ) {
			new Onboarding();
			return;
		} else {
			new Settings();
		}

		new Privacy();
		new ShippingMethod();
		new CreateShipment();

		new WooCommerce\Admin\ShippingLabel();

		new WooCommerce\Blocks\Shipping();
	}

}
