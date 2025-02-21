<?php

namespace Fraktvalg\Fraktvalg\REST\Settings;

use Fraktvalg\Fraktvalg\REST\Base;

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
	}

	public function finalize_onboarding() {
		\update_option( 'fraktvalg_configured', true );

		return new \WP_Rest_Response( [ 'status' => 'ok' ] );
	}

}
