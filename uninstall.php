<?php
/**
 * Perform plugin installation routines.
 *
 * @package Fraktvalg
 */

// Make sure the uninstall file can't be accessed directly.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	die;
}

// Remove all options and transients.
delete_option( 'fraktvalg_configured' );
delete_option( 'fraktvalg_api_key' );
delete_option( 'fraktvalg_options' );
delete_option( 'fraktvalg[\'priorityProvider\']' );
