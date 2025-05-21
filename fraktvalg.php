<?php
/**
 * Plugins primary file, in charge of including all other dependencies.
 *
 * @package Fraktvalg\Fraktvalg
 *
 * @wordpress-plugin
 * Plugin Name: Fraktvalg
 * Plugin URI: https://fraktvalg.no
 * Description: Easily provide shipping estimates for your customers from multiple providers.
 * Author: fraktvalg
 * Version: 1.2.0
 * Text Domain: fraktvalg
 * Domain Path: /languages
 * Requires Plugins: woocommerce
 * License: GPLv2 or later
 */

namespace Fraktvalg\Fraktvalg;

define( 'FRAKTVALG_BASE_PATH', __DIR__ );
define( 'FRAKTVALG_BASE_FILE', __FILE__ );
//define( 'FRAKTVALG_API_SERVER', 'https://api.fraktvalg.no/api' );
define( 'FRAKTVALG_API_SERVER', 'https://fraktvalg.share.clorith.space/api' );

/*
 * Autoloader to ensure our namespace can autoload files seamlessly.
 */
\spl_autoload_register( function ( $class ) {
	// Project-specific namespace
	$prefix = __NAMESPACE__;
	$base_dir = __DIR__ . '/Fraktvalg/';

	// Do not try to autoload anything outside our namespace.
	if ( substr( $class, 0, \strlen( $prefix ) ) !== $prefix ) {
		return;
	}

	// Remove the namespace prefix from the classname to get the relative path.
	$relative_class = \substr( $class, \strlen( $prefix ) );

	// Replace namespace separators with directory separators in the relative class name.
	$relative_class = \str_replace( '\\', '/', $relative_class );

	$file = $relative_class . '.php';

	// Validate the file using WordPress' `validate_file` function.
	if ( \validate_file( $file ) > 0 ) {
		return;
	}

	if ( \file_exists( $base_dir . $file ) ) {
		require $base_dir . $file;
	}
} );

new Setup();
