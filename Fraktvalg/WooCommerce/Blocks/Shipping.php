<?php

namespace Fraktvalg\Fraktvalg\WooCommerce\Blocks;

use Fraktvalg\Fraktvalg\REST\WooCommerce\ShippingOptions;

class Shipping {

    public function __construct() {
        new ShippingOptions();

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
}
