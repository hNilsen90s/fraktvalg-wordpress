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

	/**
	 * Make POST request with retry mechanism for better reliability
	 *
	 * @param string $endpoint The API endpoint to call
	 * @param mixed $body The request body
	 * @param int $max_attempts Maximum number of attempts (default: 2)
	 * @return array|\WP_Error The response or WP_Error on failure
	 */
	public static function post_with_retry( $endpoint, $body = null, $max_attempts = 2 ) {
		$attempt = 0;
		$last_response = null;
		
		while ( $attempt < $max_attempts ) {
			$response = \wp_remote_post(
				FRAKTVALG_API_SERVER . $endpoint,
				[
					'headers' => self::headers(),
					'body' => $body,
					'timeout' => 15, // Increase from WordPress default of 5 seconds
					'sslverify' => true
				]
			);
			
			// Return immediately on success
			if ( ! \is_wp_error( $response ) ) {
				return $response;
			}
			
			$last_response = $response;
			$attempt++;
			
			// Wait 1 second before retry (except on last attempt)
			if ( $attempt < $max_attempts ) {
				sleep(1);
			}
		}
		
		return $last_response;
	}
}
