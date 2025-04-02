import {useEffect, useState} from '@wordpress/element';
import {useBlockProps, __experimentalGetSpacingClassesAndStyles} from '@wordpress/block-editor';
import {__} from '@wordpress/i18n';
import {TruckIcon} from "@heroicons/react/24/outline";
import apiFetch from '@wordpress/api-fetch';
import { dispatch } from '@wordpress/data';
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
	const [showShipperList, setShowShipperList] = useState(false);

	const blockProps = useBlockProps({
		className: 'wp-block-fraktvalg-shipping-selector',
	});

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
						shippingTime: '1-3 virkedager',
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
					shipper.details.quickestShippingTime = Math.min(...shipper.shippingOptions.map(option => option.delivery.days)) + __(' business days', 'fraktvalg');
				});

				setShippers(newShippers);
			})
			.catch(error => console.error('Error fetching shipping options:', error))
			.finally(() => {
				setIsLoading(false);
			});
	};

	useEffect(() => {
		fetchShippingOptions();
	}, []);

	const renderContent = () => {
		if (shippers.length === 1 && !showShipperList) {
			return (
				<ShippingMethods
					methods={shippers[0].shippingOptions}
					setSelectedShipper={() => setShowShipperList(true)}
					selectedShippingMethod={selectedShippingMethod}
					onSelectMethod={selectShippingMethod}
					isLoading={isMethodSelectionLoading}
				/>
			);
		}

		if (!selectedShipper || showShipperList) {
			return (
				<Shippers
					shippers={shippers}
					onSelectShipper={handleShipperSelect}
					selectedShippingMethod={selectedShippingMethod}
				/>
			);
		}

		return (
			<ShippingMethods
				methods={selectedShipper.shippingOptions}
				setSelectedShipper={() => setSelectedShipper(null)}
				selectedShippingMethod={selectedShippingMethod}
				onSelectMethod={selectShippingMethod}
				isLoading={isMethodSelectionLoading}
			/>
		);
	};

	return (
		<div {...blockProps} style={colorStyles}>
			{isLoading ? <Loading/> : renderContent()}
		</div>
	);
}
