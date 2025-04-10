<?php

namespace Fraktvalg\Fraktvalg;

/**
 * Class PluginControls
 * 
 * Adds custom action links to the Fraktvalg plugin in the plugins list.
 */
class PluginControls {

	/**
	 * Constructor.
	 */
	public function __construct() {
		\add_filter( 'plugin_action_links_fraktvalg/fraktvalg.php', [ $this, 'add_reset_action_link' ] );
		\add_action( 'admin_init', [ $this, 'handle_reset_action' ] );
	}

	/**
	 * Add a reset action link to the plugin list.
	 *
	 * @param array $links The existing action links.
	 * @return array The modified action links.
	 */
	public function add_reset_action_link( $links ) {
		$url = \add_query_arg( 'fraktvalg_reset', '1', \admin_url( 'plugins.php' ) );
		$reset_link = \sprintf(
			'<a href="%s">%s</a>',
			\esc_url( \wp_nonce_url( $url, 'fraktvalg_reset_nonce' ) ),
			\esc_html__( 'Reset plugin and start onboarding', 'fraktvalg' )
		);
		
		$links[] = $reset_link;
		
		return $links;
	}

	/**
	 * Handle the reset action.
	 */
	public function handle_reset_action() {
		if ( ! isset( $_GET['fraktvalg_reset'] ) || '1' !== $_GET['fraktvalg_reset'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce verification is not needed as we are just checking if the query argument exists.
			return;
		}

		// Verify nonce
		if ( ! isset( $_GET['_wpnonce'] ) || ! \wp_verify_nonce( \wp_unslash( $_GET['_wpnonce'] ), 'fraktvalg_reset_nonce' ) ) {
			\wp_die( \esc_html__( 'Security check failed. Please try again.', 'fraktvalg' ) );
		}

		if ( ! \current_user_can( 'activate_plugins' ) ) {
			\wp_die( \esc_html__( 'You do not have sufficient permissions to perform this action.', 'fraktvalg' ) );
		}

		// Reset the configuration option
		\update_option( 'fraktvalg_configured', false );

		// Redirect to the onboarding page
		\wp_safe_redirect( \admin_url( 'admin.php?page=fraktvalg-onboarding' ) );
		exit;
	}
} 