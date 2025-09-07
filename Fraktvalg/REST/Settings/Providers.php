<?php

namespace Fraktvalg\Fraktvalg\REST\Settings;

use Fraktvalg\Fraktvalg\Api;
use Fraktvalg\Fraktvalg\Options;
use Fraktvalg\Fraktvalg\REST\Base;

class Providers extends Base {

	public function __construct() {
		parent::__construct();
	}

	public function register_routes() {
		\register_rest_route(
			$this->namespace,
			'/settings/providers',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_available_providers' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/settings/providers/mine',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_my_providers' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/settings/providers/priority',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_priority_provider' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'/settings/providers/disconnect',
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'disconnect_provider' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'settings/providers/store',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'store_providers' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);

		\register_rest_route(
			$this->namespace,
			'settings/providers/priority/store',
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'store_priority_providers' ),
				'permission_callback' => array( $this, 'permission_callback' ),
			]
		);
	}

	public function get_available_providers() {
		$providers = Api::get( '/shipper/list/available' );

		if ( \is_wp_error( $providers ) || 200 !== $providers['response']['code'] ) {
			return new \WP_Error( 'api_error', 'Could not fetch available providers', [ 'status' => 400 ] );
		}

		return new \WP_Rest_Response( \json_decode( $providers['body'] ) );
	}

	public function get_my_providers() {
		$allProviders = Api::get( '/shipper/list/available' );
		$providers = Api::get( '/shipper/list/mine' );

		if ( \is_wp_error( $providers ) || 200 !== $providers['response']['code'] ) {
			return new \WP_Error( 'api_error', 'Could not fetch your providers', [ 'status' => 400 ] );
		}

		$mine = \json_decode( $providers['body'] );
		$available = \json_decode( $allProviders['body'] );

		foreach ( $available->data as $key => $provider ) {
			if ( in_array( $key, array_column( $mine->data, 'id' ) ) ) {
				unset( $available->data->{ $key } );
			}
		}

		return new \WP_Rest_Response(
			[
				'mine' => $mine,
				'available' => $available,
			]
		);
	}

	public function disconnect_provider( \WP_REST_Request $request ) {
		$provider = $request->get_param( 'provider' );

		if ( ! $provider ) {
			return new \WP_Error( 'missing_provider', 'No provider was supplied', [ 'status' => 400 ] );
		}

		Api::post( '/shipper/disconnect', [ 'shipper_id' => $provider ] );

		Options::clear_cache_timestamp();

		return new \WP_Rest_Response( [ 'status' => 'OK' ] );
	}

	public function get_priority_provider() {
		$priorityProvider = \get_option( "fraktvalg['priorityProvider']", [] );

		return new \WP_Rest_Response( [ 'data' => $priorityProvider ] );
	}

	public function store_priority_providers( \WP_REST_Request $request ) {
		$priorityProviders = $request->get_param( 'priorityProvider' );

		\update_option( "fraktvalg['priorityProvider']", $priorityProviders );

		Options::clear_cache_timestamp();

		return new \WP_Rest_Response( [ 'status' => 'OK' ] );
	}

	public function store_providers( \WP_REST_Request $request ) {
		$provider = $request->get_param( 'providerId' );
		$fields = $request->get_param( 'fieldValues' ) ?: [];

		if ( ! $provider ) {
			return new \WP_Error( 'missing_providers', 'No providers were supplied', [ 'status' => 400 ] );
		}

		$response = Api::post(
			'/shipper/register',
			array_merge(
				$fields,
				[ 'shipper_id' => $provider ]
			)
		);

		// Parse response body first
		$response_body = ! \is_wp_error( $response ) && isset( $response['body'] ) 
			? json_decode( $response['body'], true ) 
			: null;

		// Check for errors in response body even with HTTP 200
		if ( \is_wp_error( $response ) || 200 !== $response['response']['code'] ||
			 ( isset( $response_body['error'] ) || 
			   isset( $response_body['success'] ) && false === $response_body['success'] ) ) {
			
			$error_message = 'Could not store providers';
			
			if ( isset( $response_body['message'] ) ) {
				$error_message = $response_body['message'];
			} elseif ( isset( $response_body['error'] ) ) {
				$error_message = $response_body['error'];
			}

			return new \WP_Error( 'api_error', $error_message, [ 'status' => 400 ] );
		}

		Options::clear_cache_timestamp();

		return new \WP_Rest_Response( [ 'status' => 'OK' ] );
	}

}
