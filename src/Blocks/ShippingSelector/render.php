<?php
/**
 * Render the shipping selector block.
 *
 * @package Fraktvalg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die();
}

$wrapper_attributes = get_block_wrapper_attributes();
$attributes        = $attributes ?? []; // Get block attributes
$encoded_attrs     = htmlspecialchars( json_encode( $attributes ), ENT_QUOTES, 'UTF-8' );
?>

<div
	data-block-name="fraktvalg/shipping-selector"
	data-attributes="<?php echo $encoded_attrs; ?>"
	id="fraktvalg-shipping"
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Core function for outputting pre-escaped content. ?>
></div>
