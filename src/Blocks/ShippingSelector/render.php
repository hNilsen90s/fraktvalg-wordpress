<?php
/**
 * Render the shipping selector block.
 *
 * @package Fraktvalg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die();
}
?>

<div
	data-block-name="fraktvalg/shipping-selector"
	id="fraktvalg-shipping"
	<?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Core function for outputting pre-escaped content. ?>
></div>
