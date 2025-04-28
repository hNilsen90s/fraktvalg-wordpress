<?php

namespace Fraktvalg\Fraktvalg\WooCommerce\Admin;

class ShippingLabel {

	public function __construct() {
		\add_action( 'admin_init', [ $this, 'init' ] );
	}

	public function init() {
		if ( ! \is_admin() ) {
			return;
		}

		$screen = \get_current_screen();
		if ( ! $screen || $screen->id !== 'woocommerce_page_wc-orders' || ! isset( $_GET['action'] ) || $_GET['action'] !== 'edit' ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- False positive report presuming the enqueue hook is handling form data.
			return;
		}

		$order = \wc_get_order( \absint( $_GET['id'] ) );

		$required_meta_fields = [
			'_fraktvalg_shipper',
			'_fraktvalg_shipment_id',
			'_fraktvalg_shipment_meta',
		];

		foreach ( $required_meta_fields as $meta_field ) {
			if ( ! $order->get_meta( $meta_field, true ) ) {
				return;
			}
		}

		\add_action( 'add_meta_boxes', [ $this, 'add_shipping_label_meta_box' ] );

		\add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );

		new \Fraktvalg\Fraktvalg\REST\WooCommerce\ShippingLabel();
	}

	public function enqueue_scripts() {
		\remove_all_actions( 'admin_notices' );

		$asset = require \plugin_dir_path( FRAKTVALG_BASE_FILE ) . 'build/label.asset.php';

		\wp_enqueue_script( 'fraktvalg-label', \plugin_dir_url( FRAKTVALG_BASE_FILE ) . 'build/label.js', $asset['dependencies'], $asset['version'], true );
		\wp_enqueue_style( 'fraktvalg-label', \plugin_dir_url( FRAKTVALG_BASE_FILE ) . 'build/label.css', [], $asset['version'] );

		\wp_set_script_translations(
			'fraktvalg-label',
			'fraktvalg',
			dirname( plugin_basename( FRAKTVALG_BASE_FILE ) ) . '/languages/'
		);
	}

	public function add_shipping_label_meta_box() {
		\add_meta_box(
			'fraktvalg_label_print_meta',
			__( 'Fraktvalg', 'fraktvalg' ),
			[ $this, 'shipping_label_meta_box' ],
			'woocommerce_page_wc-orders',
			'side',
			'high'
		);
	}

	public function shipping_label_meta_box() {
		echo '<div id="fraktvalg-label-meta-box"></div>';
	}

}
