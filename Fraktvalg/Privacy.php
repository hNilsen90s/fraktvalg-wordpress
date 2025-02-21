<?php

namespace Fraktvalg\Fraktvalg;

class Privacy {

	public function __construct() {
		\add_action( 'admin_init', [ $this, 'add_privacy_policy_content' ] );
	}

	public function add_privacy_policy_content() {
		$content = '<div class="wp-suggested-text">' .
		           '<p class="privacy-policy-tutorial">' .
		           __( 'This sample text includes the basics around how user data may be used when interacting with the shipping methods of your site. It is recommended you always consult legal counsel when amending your privacy policy, as the examples here may not always apply directly to your site.', 'fraktvalg' ) .
		           '</p>' .
		           '<p>' . __( 'We process information about you order when calculating shipping options on our store.', 'fraktvalg' ) . '</p>' .
		           '<h2>' . __( 'What we share with others', 'fraktvalg' ) . '</h2>' .
		           '<p>' . __( 'In addition to any data covered by the stores general privacy policy, When you visit your cart or the store checkout page, the following information may be shared, but not stored, with our shipping providers:', 'fraktvalg' ) . '</p>' .
		           '<ul>' .
		           '<li>' . __( 'Your cart items: This is to ensure the size of your shipment is accounted for, and any items requiring special handling are accounted for.', 'fraktvalg' ) . '</li>' .
		           '<li>' . __( 'Your shipping address: This is to ensure the shipping provider can deliver your order to your address, and can provide an accurate cost for the shipping and handling.', 'fraktvalg' ) . '</li>' .
		           '</ul>' .
		           '<p>' . __( 'When you complete an order, your address and the items being shipped will also be transmitted to our the chosen shipping provider so that they know where to deliver your order, and what items are transported with them, and may be stored in their shipping systems for to provide package tracking or other relevant information to you as a customer.', 'fraktvalg' ) .
		           '</p>' .
		           '</div>';

		\wp_add_privacy_policy_content( 'Fraktvalg', wp_kses_post( wpautop( $content, false ) ) );
	}

}
