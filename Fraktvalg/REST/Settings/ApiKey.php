<?php

namespace Fraktvalg\Fraktvalg\REST\Settings;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\REST\Base;

class ApiKey extends Base {
	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		\register_rest_route(
			$this->namespace,
			'/settings/api-key',
			[
				'methods'             => \WP_REST_Server::EDITABLE,
				'args'                => array(
					'api_key' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
				'callback'            => array( $this, 'set_api_key' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);
	}

	public function set_api_key( \WP_REST_Request $request ) {
		\update_option( 'fraktvalg_api_key', $request->get_param( 'api_key' ) );

		$api_status = Api::post(
			'/account/validate',
			[
				'key' => $request->get_param( 'api_key' ),
			]
		);

		if ( \is_wp_error( $api_status ) || 200 !== $api_status['response']['code'] ) {
			return new \WP_Error( 'api_error', 'The given API key is not valid', [ 'status' => 400 ] );
		}

		return new \WP_Rest_Response( [ 'status' => 'ok' ] );
	}

}
