<?php

namespace Fraktvalg\Fraktvalg\WooCommerce\Admin;

class FilterOrderList {

	public function __construct() {
		\add_action( 'admin_init', [ $this, 'init' ] );
	}

	public function init() {
		if ( $this->is_hpos_enabled() ) {
			\add_action( 'woocommerce_order_list_table_restrict_manage_orders', [ $this, 'add_shipment_filter' ] );
			\add_filter( 'woocommerce_order_list_table_prepare_items_query_args', [ $this, 'hpos_filter_orders_query_args' ] );
		} else {
			\add_action( 'restrict_manage_posts', [ $this, 'add_shipment_filter' ] );
			\add_filter( 'parse_query', [ $this, 'filter_orders_by_shipment_status' ] );
		}
	}

	public function add_shipment_filter() {
		global $typenow;

		$current_screen = \get_current_screen();
		
		if ( 'shop_order' === $typenow || ( \function_exists( 'wc_get_page_screen_id' ) && $current_screen && \wc_get_page_screen_id( 'shop-order' ) === $current_screen->id ) ) {
			$selected = isset( $_GET['fraktvalg_shipment_filter'] ) ? $_GET['fraktvalg_shipment_filter'] : '';
			
			echo '<select name="fraktvalg_shipment_filter" id="fraktvalg_shipment_filter">';
			echo '<option value="">' . \__( 'All shipment statuses', 'fraktvalg' ) . '</option>';
			echo '<option value="no_shipment"' . \selected( $selected, 'no_shipment', false ) . '>' . \__( 'Shipment not registered', 'fraktvalg' ) . '</option>';
			echo '<option value="has_shipment"' . \selected( $selected, 'has_shipment', false ) . '>' . \__( 'Shipment registered', 'fraktvalg' ) . '</option>';
			echo '</select>';
		}
	}

	public function filter_orders_by_shipment_status( $query ) {
		global $pagenow, $typenow;

		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}

		if ( 'edit.php' === $pagenow && 'shop_order' === $typenow ) {
			if ( isset( $_GET['fraktvalg_shipment_filter'] ) && $_GET['fraktvalg_shipment_filter'] ) {
				$meta_query = $query->get( 'meta_query' ) ?: [];
				
				if ( 'no_shipment' === $_GET['fraktvalg_shipment_filter'] ) {
					$meta_query[] = [
						'relation' => 'OR',
						[
							'key'     => '_fraktvalg_shipment_id',
							'compare' => 'NOT EXISTS',
						],
						[
							'key'     => '_fraktvalg_shipment_id',
							'value'   => '',
							'compare' => '=',
						],
					];
				} elseif ( 'has_shipment' === $_GET['fraktvalg_shipment_filter'] ) {
					$meta_query[] = [
						'key'     => '_fraktvalg_shipment_id',
						'value'   => '',
						'compare' => '!=',
					];
				}
				
				$query->set( 'meta_query', $meta_query );
			}
		}
	}

	public function hpos_filter_orders_query_args( $query_args ) {
		if ( isset( $_GET['fraktvalg_shipment_filter'] ) && $_GET['fraktvalg_shipment_filter'] ) {
			$meta_query = isset( $query_args['meta_query'] ) ? $query_args['meta_query'] : [];
			
			if ( 'no_shipment' === $_GET['fraktvalg_shipment_filter'] ) {
				$meta_query[] = [
					'relation' => 'OR',
					[
						'key'     => '_fraktvalg_shipment_id',
						'compare' => 'NOT EXISTS',
					],
					[
						'key'     => '_fraktvalg_shipment_id',
						'value'   => '',
						'compare' => '=',
					],
				];
			} elseif ( 'has_shipment' === $_GET['fraktvalg_shipment_filter'] ) {
				$meta_query[] = [
					'key'     => '_fraktvalg_shipment_id',
					'value'   => '',
					'compare' => '!=',
				];
			}
			
			$query_args['meta_query'] = $meta_query;
		}
		return $query_args;
	}

	private function is_hpos_enabled() {
		return \class_exists( 'Automattic\WooCommerce\Utilities\OrderUtil' ) && 
			   \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
	}

}
