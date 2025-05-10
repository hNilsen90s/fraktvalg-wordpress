<?php

namespace Fraktvalg\Fraktvalg;

use Fraktvalg\Fraktvalg\REST\Settings\ApiKey;
use Fraktvalg\Fraktvalg\REST\Settings\OptionalSettings;
use Fraktvalg\Fraktvalg\REST\Settings\Providers;

class Onboarding {

	public function __construct() {
		new ApiKey();
		new Providers();
		new OptionalSettings();
		new \Fraktvalg\Fraktvalg\REST\Settings\Onboarding();

		\add_action( 'admin_notices', [ $this, 'onboarding_notification' ] );
		\add_action( 'admin_notices', [ $this, 'remove_admin_notices_on_onboarding' ], 1 );
		\add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );

		\add_action( 'admin_menu', [ $this, 'add_menu_item' ] );
	}

	public function add_menu_item() {
		\add_submenu_page(
			'woocommerce',
			\esc_html__( 'Fraktvalg onboarding', 'fraktvalg' ),
			\esc_html__( 'Fraktvalg onboarding', 'fraktvalg' ),
			'manage_options',
			'fraktvalg-onboarding',
			[ $this, 'custom_admin_page_content' ],
			9999
		);
	}

	public function custom_admin_page_content() {
		if ( ! \current_user_can( 'manage_options' ) ) {
			return;
		}

		echo '<div id="fraktvalg-onboarding"></div>';
	}

	public function onboarding_notification() {
		?>
			<div class="notice notice-warning py-2">
				<p>
					<strong class="block mb-2">
						<?php esc_html_e( 'Fraktvalg onboarding', 'fraktvalg' ); ?>
					</strong>
				</p>

				<p>
					<?php esc_html_e( 'Welcome to Fraktvalg, you are only a few quick questions away from having a complete shipping integration on your website!', 'fraktvalg' ); ?>
				</p>

				<p>
					<a href="<?php echo \esc_url( \admin_url( 'admin.php?page=fraktvalg-onboarding' ) ); ?>" class="inline-block bg-primary text-white rounded-md p-3 hover:bg-primary/90 hover:text-white disabled:bg-black/80 py-1">
						<?php esc_html_e( 'Open onboarding wizard', 'fraktvalg' ); ?>
					</a>
				</p>
			</div>
		<?php
	}

	public function remove_admin_notices_on_onboarding() {
		if ( ! isset( $_GET['page'] ) || 'fraktvalg-onboarding' !== $_GET['page'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce verification is not needed as we are just comparing a query argument value.
			return;
		}

		\remove_all_actions( 'admin_notices' );
	}

	public function enqueue_scripts() {
		if ( ! isset( $_GET['page'] ) || 'fraktvalg-onboarding' !== $_GET['page'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce verification is not needed as we are just comparing a query argument value.
			return;
		}

		\remove_all_actions( 'admin_notices' );

		$asset = require \plugin_dir_path( FRAKTVALG_BASE_FILE ) . 'build/onboarding.asset.php';

		\wp_enqueue_script( 'fraktvalg-onboarding', \plugin_dir_url( FRAKTVALG_BASE_FILE ) . 'build/onboarding.js', $asset['dependencies'], $asset['version'], true );
		\wp_enqueue_style( 'fraktvalg-onboarding', \plugin_dir_url( FRAKTVALG_BASE_FILE ) . 'build/onboarding.css', [], $asset['version'] );

		\wp_set_script_translations(
			'fraktvalg-onboarding',
			'fraktvalg',
			\trailingslashit( FRAKTVALG_BASE_PATH ) . 'languages'
		);
	}

}
