<?php

namespace Fraktvalg\Fraktvalg;

class Api {

	private static function headers() {
		return [
			'X-Api-Key' => \get_option( 'fraktvalg_api_key' ),
			'X-API-Environment' => ( Options::get( 'useProduction' ) ? 'production' : 'development' ),
			'X-API-Siteurl' => \get_site_url(),
			'X-Request-Locale' => \get_user_locale(),
			'Accept' => 'application/json',
		];
	}

	public static function post( $endpoint, $body = null ) {
		return \wp_remote_post(
			FRAKTVALG_API_SERVER . $endpoint,
			[
				'headers' => self::headers(),
				'body' => $body,
			]
		);
	}

	public static function get( $endpoint, $body = null ) {
		return \wp_remote_get(
			FRAKTVALG_API_SERVER . $endpoint,
			[
				'headers' => self::headers(),
				'body' => $body,
			]
		);
	}
}
