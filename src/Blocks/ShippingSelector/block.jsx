import {useEffect, useState, useCallback} from '@wordpress/element';
import {__} from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { dispatch, select, subscribe } from '@wordpress/data';
import '@woocommerce/block-data';

import './style.pcss';
import {GetUniqueShippers} from "./utils/getUniqueShippers";
import {GetShipperRates} from "./utils/getShipperRates";
import {getShippingIcon} from "./utils/getShippingIcon";
import Loading from "./Components/Loading";
import ShippingMethods from "./Components/ShippingMethods";
import Shippers from "./Components/Shippers";

export default function Block({attributes = {}}) {
	const {primaryColor = '#2F463E', secondaryColor = '#4D8965', tertiaryColor = '#65C7A4'} = attributes;
	const [selectedShipper, setSelectedShipper] = useState(null);
	const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isMethodSelectionLoading, setIsMethodSelectionLoading] = useState(false);
	const [shippers, setShippers] = useState({});
	const [showShipperList, setShowShipperList] = useState(true);

	// Create a style object for dynamic colors
	const colorStyles = {
		'--fraktvalg-primary-color': primaryColor,
		'--fraktvalg-secondary-color': secondaryColor,
		'--fraktvalg-tertiary-color': tertiaryColor,
	};

	const selectShippingMethod = (method) => {
		if (!method || !method.rate_id) {
			return;
		}

		setIsMethodSelectionLoading(true);

		apiFetch({
			path: '/wc/store/v1/cart/select-shipping-rate',
			method: 'POST',
			data: {
				package_id: 0,
				rate_id: method.rate_id,
			},
		})
			.then(data => {
				setSelectedShippingMethod(method.rate_id);

				// Invalidate the cart store to trigger a refresh
				dispatch('wc/store/cart').invalidateResolutionForStore();
			})
			.catch(error => {
				setSelectedShippingMethod(null);
			})
			.finally(() => {
				setIsMethodSelectionLoading(false);
			});
	};

	const handleShipperSelect = (shipper) => {
		setSelectedShipper(shipper);
		setShowShipperList(false);
	};

	const fetchShippingOptions = () => {
		setIsLoading(true);

		apiFetch({
			path: '/wc/store/v1/cart',
			method: 'GET',
		})
			.then( ( data ) => {
				let newShippers = GetUniqueShippers(data);

				newShippers.forEach(shipper => {
					const rates = GetShipperRates(data, shipper);

					shipper.shippingOptions = rates.map(rate => ({
						rate_id: rate.rate_id,
						name: rate.name,
						description: rate.description,
						price: rate.price,
						shippingTime: __( '1-3 business days', 'fraktvalg' ),
						icon: getShippingIcon(rate.delivery.serviceCode),
						selected: rate.selected,
						delivery: {
							days: rate.delivery.days,
						}
					}));

					const selectedOption = shipper?.shippingOptions.find(option => option.selected) || null;

					if (selectedOption) {
						setSelectedShipper(shipper);
						setSelectedShippingMethod(selectedOption.rate_id);
					}

					shipper.details.LowestPrice = Math.min(...shipper.shippingOptions.map(option => option.price));
					const minDays = Math.min(...shipper.shippingOptions.map(option => option.delivery.days));
					shipper.details.quickestShippingTime = !isNaN(minDays) ? minDays + __(' business days', 'fraktvalg') : '1-3';
				});

				setShippers(newShippers);
			})
			.catch(error => console.error('Error fetching shipping options:', error))
			.finally(() => {
				setIsLoading(false);
			});
	};

	// Debounce function to limit how often fetchShippingOptions is called
	const debouncedFetchShippingOptions = useCallback(() => {
		// Clear any existing timeout
		if (window.shippingOptionsTimeout) {
			clearTimeout(window.shippingOptionsTimeout);
		}

		// Set a new timeout
		window.shippingOptionsTimeout = setTimeout(() => {
			fetchShippingOptions();
		}, 1000); // 1 second delay
	}, []);

	useEffect(() => {
		fetchShippingOptions();

		// Log cart data when component mounts
		const cartData = select('wc/store/cart').getCartData();

		// Monitor shipping address changes and re-fetch shipping options
		let previousShippingAddress = JSON.stringify(cartData.shippingAddress);

		const unsubscribe = subscribe(() => {
			const cartStore = select('wc/store/cart');
			const currentCartData = cartStore.getCartData();
			const currentShippingAddress = JSON.stringify(currentCartData.shippingAddress);

			// Check if shipping address has changed
			if (previousShippingAddress !== currentShippingAddress) {
				previousShippingAddress = currentShippingAddress;

				// Use debounced function instead of calling fetchShippingOptions directly
				debouncedFetchShippingOptions();
			}
		});

		// Clean up subscription and timeout when component unmounts
		return () => {
			unsubscribe();
			if (window.shippingOptionsTimeout) {
				clearTimeout(window.shippingOptionsTimeout);
			}
		};
	}, [debouncedFetchShippingOptions]);

	const renderContent = () => {
		if ( shippers.length === 1 || ( shippers.length > 1 && ! showShipperList ) ) {
			return (
				<ShippingMethods
					methods={ selectedShipper?.shippingOptions || shippers[0].shippingOptions}
					setSelectedShipper={() => setShowShipperList(true)}
					selectedShippingMethod={selectedShippingMethod}
					onSelectMethod={selectShippingMethod}
					isLoading={isMethodSelectionLoading}
					showReturnButton={ shippers.length > 1 }
				/>
			);
		}

		return (
			<Shippers
				shippers={shippers}
				onSelectShipper={handleShipperSelect}
				selectedShippingMethod={selectedShippingMethod}
			/>
		);
	};

	return (
		<div className="wp-block-fraktvalg-shipping-selector" style={colorStyles}>
			{isLoading ? (
				<Loading />
			) : isMethodSelectionLoading ? (
				<Loading text={__('Updating cart totals with your new shipping preference', 'fraktvalg')} />
			) : (
				renderContent()
			)}
		</div>
	);
}
