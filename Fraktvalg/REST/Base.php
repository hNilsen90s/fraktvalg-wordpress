<?php

namespace Fraktvalg\Fraktvalg\REST;

class Base {
	protected $namespace = 'fraktvalg/v1';

	protected $permission_role = 'manage_options';

	public function __construct() {
		\add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes() {}

	/**
	 * @param $request
	 *
	 * @return bool
	 */
	public function permission_callback( $request ) {
		return \current_user_can( $this->permission_role );
	}
}
