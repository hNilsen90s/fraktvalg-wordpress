<?php

namespace Fraktvalg\Fraktvalg\WooCommerce\Blocks;

use Fraktvalg\Fraktvalg\REST\WooCommerce\ShippingOptions;

class Shipping {

    public function __construct() {
        new ShippingOptions();

//		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_shipping_selector' ] );

	    add_filter( 'render_block', function( $block_content, $block ) {
			// TODO: Don't do this.
			return $block_content;

			if ( $block['blockName'] === 'woocommerce/cart-order-summary-block' ) {
				$block_content = preg_replace(
					'/(data-block-name="woocommerce\/cart-order-summary-shipping-block".+?<\/div>)/sm',
					'$1<div id="fraktvalg-shipping"></div>',
					$block_content
				);
			}

			if ( $block['blockName'] === 'woocommerce/checkout-shipping-methods-block' ) {
				$block_content = preg_replace(
					'/(data-block-name="woocommerce\/checkout-shipping-methods-block".+?<\/div>)/sm',
					'$1<div id="fraktvalg-shipping"></div>',
					$block_content
				);
			}

		    return $block_content;
	    }, 20, 2);

		add_action( 'init', [ $this, 'register_fraktvalg_block' ] );

	    add_filter(
		    '__experimental_woocommerce_blocks_add_data_attributes_to_block',
		    function ( $allowed_blocks ) {
			    $allowed_blocks[] = 'fraktvalg/shipping-selector';
			    return $allowed_blocks;
		    },
		    10,
		    1
	    );
    }

	public function register_fraktvalg_block() {
		$blockPath = \plugin_dir_path( FRAKTVALG_BASE_FILE ) . 'build/Blocks/ShippingSelector';

		register_block_type_from_metadata( $blockPath );
	}

    public function enqueue_shipping_selector() {
		if ( ( ! function_exists( 'is_cart' ) || ! \is_cart() ) || ( ! function_exists( 'is_checkout' ) ) &&  ! \is_checkout() ) {
		    return;
		}

	    $block_asset = require \plugin_dir_path( FRAKTVALG_BASE_FILE ) . 'build/shipping-selector.asset.php';

	    \wp_enqueue_script(
			'fraktvalg-shipping-selector',
			\plugin_dir_url( FRAKTVALG_BASE_FILE ) . 'build/shipping-selector.js',
			$block_asset['dependencies'],
			$block_asset['version'],
			true
	    );

        wp_enqueue_style(
            'fraktvalg-shipping-selector',
	        \plugin_dir_url( FRAKTVALG_BASE_FILE ) . 'build/shipping-selector.css',
	        [],
	        $block_asset['version']
        );
    }
}
