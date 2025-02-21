import {useEffect, useState} from '@wordpress/element';
import {useBlockProps} from '@wordpress/block-editor';
import {__} from '@wordpress/i18n';

import './style.pcss';
import {TruckIcon} from "@heroicons/react/24/outline";

import {GetUniqueShippers} from "./utils/getUniqueShippers";
import {GetShipperRates} from "./utils/getShipperRates";
import Loading from "./Components/Loading";
import ShippingMethods from "./Components/ShippingMethods";
import Shippers from "./Components/Shippers";

export default function Block( { className, isEditor = false } ) {
	const [ selectedShipper, setSelectedShipper ] = useState(null);
	const [ selectedShippingMethod, setSelectedShippingMethod ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );

	const [ shippers, setShippers ] = useState( {} );

	const blockProps = useBlockProps();

	const selectShippingMethod = (method) => {
		fetch( '/wp-json/wc/store/v1/cart/select-shipping-rate', {
			method: 'POST',
			body: JSON.stringify( {
				package_id: 0,
				rate_id: method?.rate_id,
			} ),
		} )
			.then( response => response.json() )
			.then( data => {
				setSelectedShippingMethod( method?.rate_id );
				console.log( data );
			} )
			.catch( error => console.error( 'Error selecting shipping method:', error ) );
	}

	const fetchShippingOptions = () => {
		setIsLoading( true );

		fetch('/wp-json/wc/store/v1/cart')
			.then(response => response.json())
			.then(data => {
				let newShippers = GetUniqueShippers( data );

				newShippers.forEach(shipper => {
					const rates = GetShipperRates(data, shipper);

					shipper.shippingOptions = rates.map(rate => ({
						rate_id: rate.rate_id,
						name: rate.name,
						price: rate.price,
						shippingTime: '1-3 virkedager', // Default value, adjust as needed
						icon: <TruckIcon className="w-10 h-10 mr-4 text-tertiary inline-block" />, // Default icon, adjust as needed
						selected: rate.selected,
						delivery: {
							days: rate.delivery.days,
						}
					}));

					const selectedOption = shipper?.shippingOptions.find(option => option.selected) || null;

					if (selectedOption) {
						setSelectedShipper(shipper);
						setSelectedShippingMethod( selectedOption.rate_id );
					}

					// Set the lowest price for each shipper
					shipper.details.LowestPrice = Math.min(...shipper.shippingOptions.map(option => option.price));
					shipper.details.quickestShippingTime = Math.min(...shipper.shippingOptions.map(option => option.delivery.days)) + __( ' business days', 'fraktvalg' );
				});

				setShippers( newShippers );

				setIsLoading( false );
			})
			.catch(error => console.error('Error fetching shipping options:', error));
	}

	useEffect(() => {
		if ( ! isEditor ) {
			fetchShippingOptions();
		}
	}, [] );

	if ( isEditor ) {
		return (
			<div { ...blockProps }>
				<Loading />
			</div>
		);
	}

	return (
		<>
			{ isLoading &&
				<Loading />
			}

			{ ! isLoading && ! selectedShipper &&
				<Shippers shippers={ shippers } onSelectShipper={ setSelectedShipper } />
			}

			{ ! isLoading && selectedShipper &&
				<ShippingMethods
					methods={ selectedShipper.shippingOptions }
					setSelectedShipper={ setSelectedShipper }
					selectedShippingMethod={ selectedShippingMethod }
					onSelectMethod={ selectShippingMethod }
				/>
			}
		</>
	)
}
