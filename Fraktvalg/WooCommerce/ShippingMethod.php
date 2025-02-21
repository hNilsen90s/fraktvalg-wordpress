<?php

namespace Fraktvalg\Fraktvalg\WooCommerce;

class ShippingMethod {

	public function __construct() {
		\add_filter( 'woocommerce_shipping_methods', [ $this, 'add_shipping_method' ] );
	}

	public function add_shipping_method( $shipping_methods ) {
		$shipping_methods['fraktvalg'] = 'Fraktvalg\Fraktvalg\WooCommerce\ShippingMethod\Fraktvalg';

		return $shipping_methods;
	}
}
