<?php

namespace Fraktvalg\Fraktvalg\REST\Settings;

use Fraktvalg\Fraktvalg\REST\Base;
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
	}

	/**
	 * Get the current theme status and WooCommerce block template information.
	 *
	 * @return \WP_REST_Response Response containing theme and template status.
	 */
	public function get_theme_status() {
		$theme = \wp_get_theme();
		$is_elementor = defined( 'ELEMENTOR_VERSION' );
		$is_block_theme = $theme->is_block_theme();
		$is_classic_theme = ! $is_block_theme && ! $is_elementor;

		// Get Site Editor URLs.
		$urls = [
			'cart'     => \add_query_arg( [ 'post' => \wc_get_page_id( 'cart' ), 'action' => 'edit' ], \admin_url( 'post.php' ) ),
			'checkout' => \add_query_arg( [ 'post' => \wc_get_page_id( 'checkout' ), 'action' => 'edit' ], \admin_url( 'post.php' ) ),
		];

		return new \WP_REST_Response(
			[
				'elementor'      => $is_elementor,
				'blockTheme'     => $is_block_theme,
				'classicTheme'   => $is_classic_theme,
				'urls'           => $urls,
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

	public function finalize_onboarding() {
		\update_option( 'fraktvalg_configured', true );
		return new \WP_REST_Response( [ 'status' => 'ok' ] );
	}

}
