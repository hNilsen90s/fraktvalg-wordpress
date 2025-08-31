<?php

namespace Fraktvalg\Fraktvalg\REST\Settings;

use Fraktvalg\Fraktvalg\REST\Base;
use Fraktvalg\Fraktvalg\Options;
use Automattic\WooCommerce\Blocks\Utils\BlockTemplateUtils;

class Onboarding extends Base {
	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		\register_rest_route(
			$this->namespace,
			'/onboarding/complete',
			[
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'finalize_onboarding' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/onboarding/theme-status',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_theme_status' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/onboarding/create-template',
			[
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'create_template' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => [
					'template' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => function($param) {
							return in_array($param, ['cart', 'checkout']);
						},
					],
				],
			]
		);

		\register_rest_route(
			$this->namespace,
			'/onboarding/store-status',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_store_status' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/onboarding/store-address',
			[
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'set_store_address' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => [
					'address' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'postcode' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'city' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'country' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
				],
			]
		);

		\register_rest_route(
			$this->namespace,
			'/onboarding/store-default-dimensions',
			[
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'set_store_default_dimensions' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => [
					'length' => [
						'required' => false,
						'validate_callback' => function($param) {
							return is_numeric( $param );
						},
					],
					'width' => [
						'required' => false,
						'validate_callback' => function($param) {
							return is_numeric( $param );
						},
					],
					'height' => [
						'required' => false,
						'validate_callback' => function($param) {
							return is_numeric( $param );
						},
					],
					'weight' => [
						'required' => false,
						'validate_callback' => function($param) {
							return is_numeric( $param );
						},
					],
				],
			]
		);
	}

	public function set_store_default_dimensions( $request ) {
		$length = $request->get_param( 'length' );
		$width = $request->get_param( 'width' );
		$height = $request->get_param( 'height' );
		$weight = $request->get_param( 'weight' );

		$options = [
			'default_dimensions' => [
				'length' => empty( $length ) ? null : $length,
				'width' => empty( $width ) ? null : $width,
				'height' => empty( $height ) ? null : $height,
				'weight' => empty( $weight ) ? null : $weight,
			]
		];

		if ( ! Options::bulk_set( $options ) ) {
			return new \WP_REST_Response( [
				'status' => 'error',
				'type' => 'notice',
				'title' => __( 'Could not save settings', 'fraktvalg' ),
				'message' => __( "An unknown error occurred, and your preferences could not be saved at this time. Please double check the options, and try again. You can always move forward, and change these later if you wish.", 'fraktvalg' )
			] );
		}

		Options::clear_cache_timestamp();

		return new \WP_REST_Response(
			[
				'status' => 'success',
				'type' => 'success',
				'title' => __( 'Settings saved', 'fraktvalg' ),
				'message' => __( 'Your default dimensions have been successfully stored.', 'fraktvalg' )
			]
		);
	}

	/**
	 * Get the current theme status and WooCommerce block template information.
	 *
	 * @return \WP_REST_Response Response containing theme and template status.
	 */
	public function get_theme_status() {
		$is_block_cart_template = \has_blocks( \wc_get_page_id( 'cart' ) );
		$is_block_checkout_template = \has_blocks( \wc_get_page_id( 'checkout' ) );

		// Get Site Editor URLs.
		$urls = [
			'cart'     => \add_query_arg( [ 'post' => \wc_get_page_id( 'cart' ), 'action' => 'edit' ], \admin_url( 'post.php' ) ),
			'checkout' => \add_query_arg( [ 'post' => \wc_get_page_id( 'checkout' ), 'action' => 'edit' ], \admin_url( 'post.php' ) ),
		];

		return new \WP_REST_Response(
			[
				'urls'           => $urls,
				'isBlockCartTemplate' => $is_block_cart_template,
				'isBlockCheckoutTemplate' => $is_block_checkout_template,
			]
		);
	}

	/**
	 * Create and return a WooCommerce block template for cart or checkout.
	 *
	 * @param \WP_REST_Request $request Request object containing template parameter.
	 * @return \WP_REST_Response Response containing template data.
	 */
	public function create_template( $request ) {
		$template_type = $request->get_param('template');
		$template_name = $template_type;

		// Retrieve template.
		$page_id = \wc_get_page_id( $template_type );
		$template = get_post( $page_id );

		$content = $template->post_content;
		// Check if the content contains the Fraktvalg block.
		if ( strpos( $content, 'fraktvalg' ) !== false ) {
			return new \WP_REST_Response(
				[
					'error' => 'Template already contains Fraktvalg block',
					'status' => 'error'
				],
			);
		}

		// Inject the Fraktvalg block in our desired location.
		switch ( $template_type ) {
			case 'cart':
				$inject_after = '<!-- /wp:woocommerce/cart-order-summary-taxes-block -->';
				break;
			case 'checkout':
				$inject_after = '<!-- /wp:woocommerce/checkout-shipping-methods-block -->';
				break;
		}
		$content = str_replace( $inject_after, $inject_after . '<!-- wp:fraktvalg/shipping-selector /-->', $content );

		// Update the page content.
		$template->post_content = $content;
		wp_update_post( $template );

		return new \WP_REST_Response(
			[
				'status'   => 'success',
				'url'      => \add_query_arg( [ 'post' => $template->ID, 'action' => 'edit' ], \admin_url( 'post.php' ) ),
			]
		);
	}

	/**
	 * Get store status including address information, product dimensions, and require address setting.
	 *
	 * @return \WP_REST_Response Response containing store status information.
	 */
	public function get_store_status() {
		// Get store address information.
		$store_address = [
			'address'   => \get_option( 'woocommerce_store_address', '' ),
			'postcode'  => \get_option( 'woocommerce_store_postcode', '' ),
			'city'      => \get_option( 'woocommerce_store_city', '' ),
			'country'   => \get_option( 'woocommerce_default_country', '' ),
		];

		// Check if all address fields are filled.
		$address_complete = ! empty( $store_address['address'] ) &&
			! empty( $store_address['postcode'] ) &&
			! empty( $store_address['city'] ) &&
			! empty( $store_address['country'] );

		// Check for products without dimensions or weight.
		$products_without_dimensions = $this->get_products_without_dimensions();

		return new \WP_REST_Response(
			[
				'address' => [
					'fields'   => $store_address,
					'complete' => $address_complete,
				],
				'products_without_dimensions' => $products_without_dimensions
			]
		);
	}

	/**
	 * Set the store address fields.
	 *
	 * @param \WP_REST_Request $request Request object containing address fields.
	 * @return \WP_REST_Response Response indicating success or failure.
	 */
	public function set_store_address( $request ) {
		$address   = $request->get_param( 'address' );
		$postcode  = $request->get_param( 'postcode' );
		$city      = $request->get_param( 'city' );
		$country   = $request->get_param( 'country' );

		\update_option( 'woocommerce_store_address', $address );
		\update_option( 'woocommerce_store_postcode', $postcode );
		\update_option( 'woocommerce_store_city', $city );
		\update_option( 'woocommerce_default_country', $country );

		Options::clear_cache_timestamp();

		return new \WP_REST_Response(
			[
				'status'  => 'success',
				'address' => [
					'address'  => $address,
					'postcode' => $postcode,
					'city'     => $city,
					'country'  => $country,
				],
			]
		);
	}

	/**
	 * Get products without dimensions or weight.
	 *
	 * @return array Array containing a boolean indicating if any products are missing dimensions.
	 */
	private function get_products_without_dimensions() {
		$args = [
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => 1, // Only need one product to determine if there's an issue
			'tax_query'      => [
				[
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'simple', // Only check simple products.
				],
			],
			'meta_query'     => [
				'relation' => 'OR',
				// Check for missing weight
				[
					'relation' => 'OR',
					[
						'key'     => '_weight',
						'compare' => 'NOT EXISTS',
					],
					[
						'key'   => '_weight',
						'value' => '',
						'compare' => '=',
					],
					[
						'key'   => '_weight',
						'value' => '0',
						'compare' => '=',
					],
				],
				// Check for missing length
				[
					'relation' => 'OR',
					[
						'key'     => '_length',
						'compare' => 'NOT EXISTS',
					],
					[
						'key'   => '_length',
						'value' => '',
						'compare' => '=',
					],
					[
						'key'   => '_length',
						'value' => '0',
						'compare' => '=',
					],
				],
				// Check for missing width
				[
					'relation' => 'OR',
					[
						'key'     => '_width',
						'compare' => 'NOT EXISTS',
					],
					[
						'key'   => '_width',
						'value' => '',
						'compare' => '=',
					],
					[
						'key'   => '_width',
						'value' => '0',
						'compare' => '=',
					],
				],
				// Check for missing height
				[
					'relation' => 'OR',
					[
						'key'     => '_height',
						'compare' => 'NOT EXISTS',
					],
					[
						'key'   => '_height',
						'value' => '',
						'compare' => '=',
					],
					[
						'key'   => '_height',
						'value' => '0',
						'compare' => '=',
					],
				],
			],
		];

		$products = \get_posts( $args );

		// Return a simple boolean indicating if any products are missing dimensions
		return [
			'has_products_without_dimensions' => ! empty( $products ),
		];
	}

	public function finalize_onboarding() {
		\update_option( 'fraktvalg_configured', true );

		Options::clear_cache_timestamp();

		return new \WP_REST_Response( [ 'status' => 'ok' ] );
	}

}
