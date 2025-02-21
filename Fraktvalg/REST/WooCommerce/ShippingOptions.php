<?php

namespace Fraktvalg\Fraktvalg\REST\WooCommerce;

use Fraktvalg\Fraktvalg\REST\Base;

class ShippingOptions extends Base {

	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/woocommerce/shipping-options',
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_shipping_options' ),
				'permission_callback' => '__return_true',
			]
		);
	}

	public function get_shipping_options() {
		if ( ! class_exists( 'WC_Session_Handler' ) ) {
			return new \WP_Error( 'woocommerce_not_loaded', 'WooCommerce is not loaded', [ 'status' => 500 ] );
		}

		if ( ! \WC()->session ) {
			\WC()->session = new \WC_Session_Handler();
			\WC()->session->init();
		}

		if ( ! \WC()->cart ) {
			\WC()->cart = new \WC_Cart();
		}

		if ( ! \WC()->customer ) {
			\WC()->customer = new \WC_Customer();
		}

		// Calcualte cart totals.
		\WC()->cart->calculate_totals();

		$packages = \WC()->shipping()->get_packages();
		$shipping_methods = \WC()->shipping->get_shipping_methods();
		$shipping_options = [];

		return $packages;
	}

}
