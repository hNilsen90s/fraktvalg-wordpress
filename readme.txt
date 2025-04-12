=== Fraktvalg ===
Tags: frakt, woocommerce, posten, postnord, helthjem
Contributors: fraktvalg
Requires at least: 5.8
Requires PHP: 7.4
Tested up to: 6.7
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Easily provide shipping estimates for your customers based on their postal code.

== Description ==

Fraktvalg is a comprehensive shipping solution designed for WooCommerce, seamlessly integrating major Norwegian carriers Posten, Bring, PostNord, and Helthjem into a single, user-friendly platform. This plugin streamlines your shipping processes, eliminating the need for multiple plugins and ensuring accurate, real-time shipping rates to enhance the customer experience.

**Key Features:**

- Unified Carrier Integration: Consolidate Posten, Bring, PostNord, and Helthjem services within one plugin, simplifying your shipping management.
- Real-Time Shipping Rates: Automatically retrieve up-to-date shipping rates based on product weight, dimensions, and your negotiated agreements, ensuring precise pricing at checkout.
- Customizable Pricing: Set fixed shipping prices, apply surcharges for packaging, or offer discounts to suit your business needs.
- Nearest Pickup Locations: Display the closest pickup points to customers based on their postal codes, enhancing convenience and satisfaction.
- Direct Label Printing: Print shipping labels directly from your WooCommerce dashboard, streamlining order fulfillment and reducing processing time.
- Preferred Carrier Selection: Set and prioritize your preferred shipping providers, ensuring the best options are presented to your customers.

**Requirements:**

To utilize Fraktvalg, you must have active accounts or agreements with the respective shipping providers:

- [PostNord](https://postnord.no): Register as a business customer to access their services.
- [Bring/Posten](https://bring.no): Establish a business agreement to utilize their shipping solutions.
- [Helthjem](https://helthjem.no): Partner with Helthjem to access their delivery network.

**How It Works:**

Fraktvalg operates as a Software-as-a-Service (SaaS) solution, requiring an API key obtainable by signing up at Fraktvalg. Once integrated, the plugin calculates shipping costs in real-time by sending order details—such as item weight, sizes, your shop address, and the customer's delivery address—to the Fraktvalg API. This process ensures accurate communication with each shipping provider, delivering precise rates and options at checkout.

**Privacy information:**

While the plugin does not directly store user data, it transmits necessary order information to the Fraktvalg API to calculate shipping costs accurately. This includes product details and delivery addresses. For comprehensive information on data handling and protection, please review the [Fraktvalg Privacy Policy](https://api.fraktvalg.no/personvern). Additional privacy details are also available in your WordPress admin panel under Tools > Privacy.

**Getting Started:**

Experience the benefits of Fraktvalg with a 14-day free trial, offering unrestricted access to all features. The plugin is designed for quick setup, allowing you to integrate and configure your shipping options in under 5 minutes. With no coding required and free support available, Fraktvalg ensures a smooth and efficient shipping management experience for your WooCommerce store.

By choosing Fraktvalg, you streamline your shipping processes, enhance customer satisfaction with flexible delivery options, and potentially increase your store's conversion rates through optimized shipping solutions.

== Frequently Asked Questions ==

= I have a suggestion for enhancements! =

Fantastic! The Fraktvalg plugin is open source, and you can browse the code or give feedback and suggestions via the [GitHub repository](https://github.com/Fraktvalg/fraktvalg-wordpress)

== Changelog ==

= 1.2.0 (2025-04-12) =
* Improved shipping method front-end presentation.
* Improved accessibility of shipping provider and method interfaces.
* Improved onboarding to guide users through required store settings.
* Add a means to reset the plugin to the onboarding stage.
* Added more contextual feedbacks in the settings panels.
* Resolve an issue where preferred providers did not alwways properly apply discounts, and only matched prices.
* Fixed so you can de-select a preferred shipping provider.

= 1.1.0 (2025-04-06) =
* Align the shipping block better on the x-axis in themes.
* Better shipping labels in classic themes wit hthe default shipping display from WooCommerce.
* Add support for more provier logo types from the Fraktvalg API.
* Better presentation of error messages when setting up shipping providers.
* Improve the onboarding wizard by automating the setup process for block themes when possible.
* Improve shipping rate update times by leveraging the WooCommerce data stores.

= 1.0.0 (2025-03-22) =
* Initial release
