<?php

namespace Fraktvalg\Fraktvalg\REST\Settings;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\Options;
use Fraktvalg\Fraktvalg\REST\Base;

class ProviderShippingOptions extends Base {

	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		\register_rest_route(
			$this->namespace,
			'/settings/providers/methods',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'args' => array(
					'shipper_id' => array(
						'type' => 'string',
						'required' => true,
					),
				),
				'callback' => array( $this, 'get_provider_shipping_options' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/settings/providers/methods/store',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'set_provider_shipping_options' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);
	}

	public function set_provider_shipping_options( \WP_REST_Request $request ) {
		$fields = $request->get_param( 'fields' );
		$provider = $request->get_param( 'shipper_id' );

		$options = Api::post(
			'/shipper/list/methods/store',
			[
				'shipper_id' => $provider,
				'fields'     => $fields,
			]
		);

		if ( \is_wp_error( $options ) || 200 !== $options['response']['code'] ) {
			return new \WP_Error( 'api_error', 'Could not update available shipping methods with the provider at this time', [ 'status' => 400 ] );
		}

		Options::clear_cache_timestamp();

		return new \WP_Rest_Response( \json_decode( $options['body'] ) );
	}

	public function get_provider_shipping_options( \WP_REST_Request $request ) {
		$options = Api::post(
			'/shipper/list/methods/',
			[
				'shipper_id' => $request->get_param( 'shipper_id' ),
			]
		);

		if ( \is_wp_error( $options ) || 200 !== $options['response']['code'] ) {
			return new \WP_Error( 'api_error', 'Could not fetch providers available shipping methods', [ 'status' => 400 ] );
		}

		return new \WP_Rest_Response( \json_decode( $options['body'] ) );
	}

}
