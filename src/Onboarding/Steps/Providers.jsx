import React from 'react';
import { useState, useEffect } from 'react';

import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import ProviderFields from "../../Components/ProviderFields";
import {ArrowPathIcon, ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/solid";
import Button from "../../FormElements/Button";
import ProviderLogo from "../../Components/ProviderLogo";
import {clsx} from "clsx";


export function ExpandableElement({ supplierId, supplier, title, content, isConnected = false, visible = true, classNames = '', innerClassNames = '' }) {
	const [ isVisible, setIsVisible ] = useState( visible );
	const outerClasses = clsx(
		'border bg-white rounded-md',
		classNames
	);
	const innerClasses = clsx(
		'border-t-2 border-gray-100 p-4',
		innerClassNames
	);

	return (
		<div className={ outerClasses }>
			<button className="flex w-full p-4 items-center justify-between" onClick={ () => setIsVisible( ! isVisible ) }>
				<h2 className="text-lg font-bold w-full">
					<div
						className="flex item-center justify-between focus:outline-none w-full"
					>
						<div className="flex">
							{ supplier?.logo &&
								<div>
									<ProviderLogo logo={ supplier?.logo } alt={ title } className="w-8 h-8 mr-2" />
								</div>
							}

							<div className="inline-flex items-center gap-4">
								<span>
									{title}
								</span>
							</div>
						</div>

						<div className="flex items-center gap-4">
							{ isConnected &&
								<div className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-600">
									{ __( 'Connected', 'fraktvalg' ) }
								</div>
							}
							{ ! isConnected &&
								<div className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-600">
									{ __( 'Disconnected', 'fraktvalg' ) }
								</div>
							}
							{ isVisible
								? <ChevronUpIcon className="h-6 w-6 text-gray-600" />
								: <ChevronDownIcon className="h-6 w-6 text-gray-600" />
							}
						</div>
					</div>
				</h2>
			</button>
			{ isVisible && (
				<div className={ innerClasses }>
					{content}
				</div>
			)}
		</div>
	);
}

export default function Providers({nextStep}) {
	const [suppliers, setSuppliers] = useState({});
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [ priorityProvider, setPriorityProvider ] = useState(null);
	const [ providerLoadingIndicator, setProviderLoadingIndicator ] = useState('' );
	const [ isConnectedProviders, setIsConnectedProviders ] = useState([]);

	const [ providerFieldValues, setProviderFieldValues ] = useState({});

	const setFieldValueCallback = ( provider, values ) => {
		setProviderFieldValues( { ...providerFieldValues, [ provider ]: values } );
	}

	const fetchSuppliers = () => {
		setError(null);

		apiFetch({
			path: 'fraktvalg/v1/settings/providers',
			method: 'GET'
		}).then((response) => {
			setSuppliers(response?.data || {});
		}).catch((error) => {
			setError(error?.message);
		}).then( () => {
			setIsLoading( false );
		});
	}

	const storeProviders = ( key ) => {
		setProviderLoadingIndicator( key );
		setError(null);

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/store',
			method: 'POST',
			data: {
				providerId: key,
				fieldValues: providerFieldValues[ key ]
			}
		}).then((response) => {
			setProviderLoadingIndicator( '' );
			setIsConnectedProviders( [ ...isConnectedProviders, key ] );
		}).catch((error) => {
			console.error( error );
			setError(error?.message || __('Failed to connect to provider', 'fraktvalg'));
			setProviderLoadingIndicator( '' );
		});
	}

	useEffect(() => {
		fetchSuppliers();
	}, []);

	if ( isLoading ) {
		return (
			<div className="flex flex-col justify-center items-center h-64">
				<ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
				<div className="text-lg">
					Fetching available providers...
				</div>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-3">
			<span className="text-xl">Nesten ferdig, vi trenger å vite hvilke fraktleverandører du har en avtale med.</span>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
					<strong className="font-bold">{__('Error:', 'fraktvalg')} </strong>
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{Object.keys(suppliers).map((key) => (
				<ExpandableElement
					key={key}
					title={suppliers[key]?.name}
					supplierId={key}
					supplier={suppliers[key]}
					visible={ false }
					isConnected={ isConnectedProviders.includes( key ) }
					content={
						<div className="relative grid grid-cols-1 gap-4">
							{ providerLoadingIndicator === key &&
								<div className="absolute w-full h-full top-0 left-0 bg-white flex flex-col justify-center items-center gap-2">
									<ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
									<span>
											{ __( 'Connecting provider, one moment please...', 'fraktvalg' ) }
										</span>
								</div>
							}

							<ProviderFields provider={key} fields={suppliers[key]?.fields || []}
											callback={setFieldValueCallback}/>

							<Button type="button" onClick={ () => storeProviders( key ) }>
								{ __( 'Connect to this provider', 'fraktvalg' ) }
							</Button>
						</div>
					}
				/>
			))}

			<Button type="button" onClick={nextStep}>
				{ __( 'Next step', 'fraktvalg' ) }
			</Button>
		</div>
	)
}
