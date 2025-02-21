<?php

namespace Fraktvalg\Fraktvalg\REST\Settings;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\Options;
use Fraktvalg\Fraktvalg\REST\Base;

class OptionalSettings extends Base {
	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		\register_rest_route(
			$this->namespace,
			'/settings/optional-settings',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_options' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/settings/optional-settings',
			[
				'methods'             => \WP_REST_Server::EDITABLE,
				'args'                => array(
					'options' => array(
						'type'       => 'object',
						'required'   => true,
					)
				),
				'callback'            => array( $this, 'set_options' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);
	}

	public function get_options() {
		return new \WP_Rest_Response( [ 'data' => Options::get() ] );
	}

	public function set_options( \WP_REST_Request $request ) {
		$options = $request->get_param( 'options' );

		if ( ! Options::bulk_set( $options ) ) {
			return new \WP_Rest_Response( [
				'status' => 'ok',
				'type' => 'notice',
				'title' => __( 'Could not save settings', 'fraktvalg' ),
				'message' => __( "An unknown error occurred, and your preferences could not be saved at this time. Please double check the options, and try again. You can always move forward, and change these later if you wish.", 'fraktvalg' )
			] );
		}

		return new \WP_Rest_Response( [
			'status' => 'ok',
			'type' => 'success',
			'title' => __( 'Settings saved', 'fraktvalg' ),
			'message' => __( 'Your optional preferences have been successfully stored.', 'fraktvalg' )
		] );
	}

}
