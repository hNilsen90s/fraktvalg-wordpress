import React from 'react';
import { useState, useEffect } from 'react';

import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import Wrapper from "../Components/Wrapper";
import {ArrowPathIcon, ArrowRightIcon, CheckCircleIcon, PlusIcon} from "@heroicons/react/24/solid";
import Notification from "../../Components/Notifications";
import ProviderFields from "../../Components/ProviderFields";
import Button from "../../FormElements/Button";
import {ExpandableElement} from "../../Onboarding/Steps/Providers";
import ProviderLogo from "../../Components/ProviderLogo";
import {AdjustmentsHorizontalIcon} from "@heroicons/react/16/solid";

export default function Providers({setProvider, setTab}) {
	const [allSuppliers, setAllSuppliers] = useState({});
	const [suppliers, setSuppliers] = useState({});
	const [error, setError] = useState(null);
	const [errorContext, setErrorContext] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [ priorityProvider, setPriorityProvider ] = useState(null);
	const [ priorityProviderDiscount, setPriorityProviderDiscount ] = useState( 10 );
	const [ priorityProviderDiscountType, setPriorityProviderDiscountType ] = useState('percent' );
	const [ providerLoadingIndicator, setProviderLoadingIndicator ] = useState('' );

	const [ providerFieldValues, setProviderFieldValues ] = useState({});

	const setFieldValueCallback = ( provider, values ) => {
		setProviderFieldValues( { ...providerFieldValues, [ provider ]: values } );
	}

	const fetchSuppliers = () => {
		setError(null);
		setErrorContext('');

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/mine',
			method: 'GET'
		}).then((response) => {
			setSuppliers(response?.mine?.data || {});
			setAllSuppliers(response?.available?.data || {});

			if ( response?.available?.data ) {
				Object.keys( response?.available?.data ).map( (key) => {
					setProviderFieldValues( { ...providerFieldValues, [ key ]: response?.available?.data[ key ]?.fields } );
				} );
			}

			if ( response?.mine?.data ) {
				response?.mine?.data?.forEach( (provider) => {
					if ( allSuppliers[ provider?.id ] ) {
						// Remove the provider from the allSuppliers object, as we want this data to be handled in the suppliers object.
						let modifiedALlSuppliers = { ...allSuppliers };
						delete modifiedALlSuppliers[ provider?.id ];
						setAllSuppliers( modifiedALlSuppliers );
					}

					setProviderFieldValues( { ...providerFieldValues, [ provider?.id ]: provider?.fields } );
				} );
			}
		}).catch((error) => {
			setErrorContext('fetching providers');
			setError(error?.message);
		}).then( () => {
			setIsLoading( false );
		});
	}

	const fetchPriorityProvider = () => {
		apiFetch({
			path: 'fraktvalg/v1/settings/providers/priority',
			method: 'GET'
		}).then((response) => {
			setPriorityProvider( response?.data?.providerId );
			setPriorityProviderDiscount( response?.data?.discount );
			setPriorityProviderDiscountType( response?.data?.discountType );
		});
	}

	const storeProviders = ( key ) => {
		setProviderLoadingIndicator( key );
		setError(null);
		setErrorContext('');

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/store',
			method: 'POST',
			data: {
				providerId: key,
				fieldValues: providerFieldValues[ key ]
			}
		}).then( (response) => {
			setProviderLoadingIndicator( '' );
			fetchSuppliers();
		}).catch((error) => {
			setProviderLoadingIndicator( '' );
			setErrorContext('saving provider settings');
			setError(error?.message || __('Failed to save provider settings', 'fraktvalg'));
		});
	}

	const storePriorityProvider = () => {
		setError(null);
		setErrorContext('');
		
		apiFetch({
			path: 'fraktvalg/v1/settings/providers/priority/store',
			method: 'POST',
			data: {
				priorityProvider: {
					providerId: priorityProvider,
					discount: priorityProviderDiscount,
					discountType: priorityProviderDiscountType
				}
			}
		}).then((response) => {
			fetchPriorityProvider();
		}).catch((error) => {
			setErrorContext('saving priority provider settings');
			setError(error?.message || __('Failed to save priority provider settings', 'fraktvalg'));
		});
	}

	const disconnectProvider = ( provider ) => {
		if ( ! confirm( __( 'Are you sure you want to disconnect this provider?', 'fraktvalg' ) ) ) {
			return;
		}

		setProviderLoadingIndicator( provider?.id );
		setError(null);
		setErrorContext('');

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/disconnect',
			method: 'POST',
			data: {
				provider: provider?.id
			}
		}).then((response) => {
			setProviderLoadingIndicator('');
			fetchSuppliers();
		}).catch((error) => {
			setProviderLoadingIndicator('');
			setErrorContext('disconnecting provider');
			setError(error?.message || __('Failed to disconnect provider', 'fraktvalg'));
		});
	}

	useEffect(() => {
		fetchSuppliers();
		fetchPriorityProvider();
	}, []);

	if ( isLoading ) {
		return (
			<Wrapper title="My providers">
				<div className="flex flex-col justify-center items-center h-64">
					<ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
					<div className="text-lg">
						{ __( 'Fetching available providers...', 'fraktvalg' ) }
					</div>
				</div>
			</Wrapper>
		)
	}

	return (
		<Wrapper title="My providers">
			<div className="grid grid-cols-1 gap-3">
				{ error &&
					<Notification type="error" title={`Error ${errorContext ? errorContext : 'fetching providers'}`}>
						{ error }
					</Notification>
				}

				{Object.keys(suppliers).map((key) => (
					<ExpandableElement
						isConnected={ true }
						key={key}
						title={suppliers[key]?.name}
						supplierId={key}
						supplier={suppliers[key]}
						content={
							<div className="relative grid grid-cols-1 gap-4">
								{ providerLoadingIndicator === key &&
									<div className="absolute w-full h-full top-0 left-0 bg-white flex flex-col justify-center items-center gap-2">
										<ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
										<span>
											{ __( 'Saving provider settings, one moment please...', 'fraktvalg' ) }
										</span>
									</div>
								}

								<ProviderFields includeOptional provider={key} fields={suppliers[key]?.fields || []}
												callback={setFieldValueCallback}/>

								<div className="flex flex-col md:flex-row justify-between gap-2">
									<div className="flex flex-col md:flex-row justify-start gap-2">
										<Button type="button" className="md:inline-block md:w-fit"
												onClick={ () => {
													setProvider( suppliers[ key ] );
													setTab( 'shipping-methods' );
												} }
										>
											<AdjustmentsHorizontalIcon className="w-4 h-4 mr-2 inline-block" />
											{ __( 'Configure shipping methods', 'fraktvalg' ) }
										</Button>
									</div>

									<div className="flex flex-col md:flex-row justify-end gap-2">
										<Button className="md:inline-block md:w-fit bg-red-600 hover:bg-red-500 active:bg-red-500 focus:bg-red-500" type="button" onClick={ () => disconnectProvider( suppliers[ key ] ) }>
											{ __( 'Disconnect provider', 'fraktvalg' ) }
										</Button>

										<Button className="md:inline-block md:w-fit" type="button" onClick={ () => storeProviders( suppliers[ key ] ) }>
											{ __( 'Update provider settings', 'fraktvalg' ) }
										</Button>
									</div>
								</div>
							</div>
						}
					/>
				))}

				<hr className="border-gray-200 my-2" />

				{Object.keys(allSuppliers).map((key) => (
					<ExpandableElement
						key={key}
						title={allSuppliers[key]?.name}
						supplierId={key}
						supplier={allSuppliers[key]}
						visible={ false }
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

								<ProviderFields provider={key} fields={allSuppliers[key]?.fields || []}
												callback={setFieldValueCallback}/>

								<Button type="button" onClick={ () => storeProviders( key ) }>
									{ __( 'Connect to this provider', 'fraktvalg' ) }
								</Button>
							</div>
						}
					/>
				))}

				<div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
					<div className="flex flex-col items-center text-center">
						<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
							<PlusIcon className="w-8 h-8 text-primary" />
						</div>

						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							{ __( 'More providers are coming 🥳', 'fraktvalg' ) }
						</h2>
						<p className="text-gray-600 mb-4">
							{ __( 'We are continually working to integrate more shipping providers to you you more opportunities.', 'fraktvalg' ) }
						</p>
						<div className="space-y-2">
							<p className="text-sm text-gray-600">
								{ __( 'Is there someone you would like to see here?', 'fraktvalg' ) }
							</p>
							<a href="mailto:hei@fraktvalg.no" className="inline-flex items-center text-custom hover:text-custom-dark font-medium">
								<span>
									{ __( 'Send us an e-mail', 'fraktvalg' ) }
								</span>
								<ArrowRightIcon className="ml-1 w-4 h-4" />
							</a>
						</div>
					</div>
				</div>

				{ Object.keys( suppliers ).length > 1 &&
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							{ __( 'Preferred provider', 'fraktvalg' ) }
						</h2>
						<p className="text-gray-600 mb-4">
							{ __( 'Choose which provider should always be the cheapest option in your store. This gives you the opportunity to prioritize one provider by making their prices more competitive.', 'fraktvalg' ) }
						</p>

						<div className="grid grid-cols-1 gap-4">
							<p>
								{ __( 'Price reduction for your preferred provider', 'fraktvalg' ) }
							</p>

							<div className="flex items-center gap-3">
								<input value={ priorityProviderDiscount } onChange={ (e) => setPriorityProviderDiscount( e.target.value ) } type="number" min="0" step="1" placeholder="10" className="w-16 border border-gray-300 rounded-md p-2" />
								<select className="border border-gray-300 rounded-md p-2" value={ priorityProviderDiscountType } onChange={ (e) => setPriorityProviderDiscountType( e.target.value ) }>
									<option value="percent">%</option>
									<option value="fixed">NOK</option>
								</select>

								<label htmlFor="something">
									{ __( 'Determine how much cheaper your preferred provider should be compared to the cheapest competitor.', 'fraktvalg' ) }
								</label>
							</div>

							<div className="flex gap-4">
								{Object.keys(suppliers).map((key) => (
									<label key={key} className="relative cursor-pointer grow flex flex-col gap-2 items-center border-2 border-gray-300 rounded-lg p-4 hover:border-primary peer-checked:border-primary transition-all duration-200"
										onClick={(e) => {
											// Prevent the default radio behavior
											e.preventDefault();
											// Toggle selection
											setPriorityProvider(priorityProvider === key ? null : key);
										}}>
										<input
											type="radio"
											name="preferred_provider"
											value={key}
											className="sr-only peer"
											checked={priorityProvider === key}
										/>

										{ suppliers[ key ]?.logo &&
											<ProviderLogo logo={ suppliers[ key ]?.logo } className="w-8 h-8" />
										}

										<span className="text-lg font-medium text-gray-900">
											{ suppliers[ key ]?.name }
										</span>

										<div className="absolute top-2 right-2 hidden peer-checked:block">
											<CheckCircleIcon className="w-6 h-6 text-primary" />
										</div>

										<p className="text-sm text-gray-5400 text-center">
											{ suppliers[ key ]?.description }
										</p>

										<p className="text-xs text-primary font-medium peer-checked:block hidden">
											{ __( 'Currently chosen as your preferred provider', 'fraktvalg' ) }
										</p>
									</label>
								))}
							</div>

							<Button type="button" onClick={storePriorityProvider}>
								{ __( 'Save preferred provider preferences', 'fraktvalg' ) }
							</Button>
						</div>
					</div>
				}
			</div>
		</Wrapper>
	)
}
