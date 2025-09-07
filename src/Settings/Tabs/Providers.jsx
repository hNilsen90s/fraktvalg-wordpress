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

export default function Providers({
	allSuppliers,
	suppliers,
	priorityProvider,
	priorityProviderDiscount,
	priorityProviderDiscountType,
	providerFieldValues,
	isLoading,
	error,
	setError,
	setProvider,
	setTab,
	setProviderFieldValueCallback,
	onUpdatePriorityProvider
}) {
	const [ providerLoadingIndicator, setProviderLoadingIndicator ] = useState('');
	const [ successMessage, setSuccessMessage ] = useState('');

	const storeProviders = (key) => {
		console.log( 'Loading indicator applied to :', key?.id );
		setProviderLoadingIndicator(key?.id);

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/store',
			method: 'POST',
			data: {
				providerId: key?.id,
				fieldValues: providerFieldValues[key?.id]
			}
		}).then(() => {
			setProviderLoadingIndicator('');
			// Refresh provider list to show actual status
			fetchProviders();
		}).catch((error) => {
			setProviderLoadingIndicator('');
			setError(error?.message || __('Failed to save provider settings', 'fraktvalg'));
		});
	};

	const storePriorityProvider = () => {
		setSuccessMessage('');

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
		}).then(() => {
			setSuccessMessage(__('Preferred provider settings saved successfully', 'fraktvalg'));

			// Clear success message after 5 seconds
			setTimeout(() => {
				setSuccessMessage('');
			}, 5000);
		}).catch((error) => {
			setError(error?.message || __('Failed to save priority provider settings', 'fraktvalg'));
		});
	};

	const disconnectProvider = (provider) => {
		if (!confirm(__( 'Are you sure you want to disconnect this provider?', 'fraktvalg'))) {
			return;
		}

		setProviderLoadingIndicator(provider?.id);

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/disconnect',
			method: 'POST',
			data: {
				provider: provider?.id
			}
		}).then(() => {
			setProviderLoadingIndicator('');
		}).catch((error) => {
			setProviderLoadingIndicator('');
			setError(error?.message || __('Failed to disconnect provider', 'fraktvalg'));
		});
	};

	if (isLoading) {
		return (
			<Wrapper title={__('My providers', 'fraktvalg')}>
				<div className="flex flex-col justify-center items-center h-64">
					<ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
					<div className="text-lg">
						{__( 'Fetching available providers...', 'fraktvalg')}
					</div>
				</div>
			</Wrapper>
		)
	}

	return (
		<Wrapper title={__('My providers', 'fraktvalg')}>
			<div className="grid grid-cols-1 gap-3">
				{error &&
					<Notification type="error" title={__('Error fetching providers', 'fraktvalg')}>
						{error}
					</Notification>
				}

				{Object.keys(suppliers).map((key) => (
					<ExpandableElement
						isConnected={true}
						key={key}
						title={suppliers[key]?.name}
						supplierId={suppliers[key]?.id}
						supplier={suppliers[key]}
						content={
							<div className="relative grid grid-cols-1 gap-4">
								{providerLoadingIndicator === suppliers[key]?.id &&
									<div className="absolute w-full h-full top-0 left-0 bg-white flex flex-col justify-center items-center gap-2">
										<ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
										<span>
											{__( 'Saving provider settings, one moment please...', 'fraktvalg')}
										</span>
									</div>
								}

								<ProviderFields
									includeOptional
									provider={suppliers[key]?.id}
									fields={suppliers[key]?.fields || []}
									callback={setProviderFieldValueCallback}
								/>

								<div className="flex flex-col md:flex-row justify-between gap-2">
									<div className="flex flex-col md:flex-row justify-start gap-2">
										<Button
											type="button"
											className="md:inline-block md:w-fit"
											onClick={() => {
												setProvider(suppliers[key]);
												setTab('shipping-methods');
											}}
										>
											<AdjustmentsHorizontalIcon className="w-4 h-4 mr-2 inline-block" />
											{__( 'Configure shipping methods', 'fraktvalg')}
										</Button>
									</div>

									<div className="flex flex-col md:flex-row justify-end gap-2">
										<Button
											className="md:inline-block md:w-fit bg-red-600 hover:bg-red-500 active:bg-red-500 focus:bg-red-500"
											type="button"
											onClick={() => disconnectProvider(suppliers[key])}
										>
											{__( 'Disconnect provider', 'fraktvalg')}
										</Button>

										<Button
											className="md:inline-block md:w-fit"
											type="button"
											onClick={() => storeProviders(suppliers[key])}
										>
											{__( 'Update provider settings', 'fraktvalg')}
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
						supplierId={allSuppliers[key]?.id}
						supplier={allSuppliers[key]}
						visible={false}
						content={
							<div className="relative grid grid-cols-1 gap-4">
								{providerLoadingIndicator === allSuppliers[key]?.id &&
									<div className="absolute w-full h-full top-0 left-0 bg-white flex flex-col justify-center items-center gap-2">
										<ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
										<span>
											{__( 'Connecting provider, one moment please...', 'fraktvalg')}
										</span>
									</div>
								}

								<ProviderFields
									provider={allSuppliers[key]?.id}
									fields={allSuppliers[key]?.fields || []}
									callback={setProviderFieldValueCallback}
								/>

								<Button type="button" onClick={() => storeProviders(allSuppliers[key])}>
									{__( 'Connect to this provider', 'fraktvalg')}
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
							{__( 'More providers are coming 🥳', 'fraktvalg')}
						</h2>
						<p className="text-gray-600 mb-4">
							{__( 'We are continually working to integrate more shipping providers to you you more opportunities.', 'fraktvalg')}
						</p>
						<div className="space-y-2">
							<p className="text-sm text-gray-600">
								{__( 'Is there someone you would like to see here?', 'fraktvalg')}
							</p>
							<a href="mailto:hei@fraktvalg.no" className="inline-flex items-center text-custom hover:text-custom-dark font-medium">
								<span>
									{__( 'Send us an e-mail', 'fraktvalg')}
								</span>
								<ArrowRightIcon className="ml-1 w-4 h-4" />
							</a>
						</div>
					</div>
				</div>

				{Object.keys(suppliers).length > 1 &&
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							{__( 'Preferred provider', 'fraktvalg')}
						</h2>
						<p className="text-gray-600 mb-4">
							{__( 'Choose which provider should always be the cheapest option in your store. This gives you the opportunity to prioritize one provider by making their prices more competitive.', 'fraktvalg')}
						</p>

						<div className="grid grid-cols-1 gap-4">
							{successMessage &&
								<Notification type="success">
									{successMessage}
								</Notification>
							}

							<p>
								{__( 'Price reduction for your preferred provider', 'fraktvalg')}
							</p>

							<div className="flex items-center gap-3">
								<input
									value={priorityProviderDiscount}
									onChange={(e) => onUpdatePriorityProvider(priorityProvider, e.target.value, priorityProviderDiscountType)}
									type="number"
									min="0"
									step="1"
									placeholder="10"
									className="w-16 border border-gray-300 rounded-md p-2"
								/>
								<select
									className="border border-gray-300 rounded-md p-2"
									value={priorityProviderDiscountType}
									onChange={(e) => onUpdatePriorityProvider(priorityProvider, priorityProviderDiscount, e.target.value)}
								>
									<option value="percent">{__('%', 'fraktvalg')}</option>
									<option value="fixed">{__('NOK', 'fraktvalg')}</option>
								</select>

								<label htmlFor={__('something', 'fraktvalg')}>
									{__( 'Determine how much cheaper your preferred provider should be compared to the cheapest competitor.', 'fraktvalg')}
								</label>
							</div>

							<div className="flex gap-4">
								{Object.keys(suppliers).map((key) => (
									<label
										key={key}
										className="relative cursor-pointer grow flex flex-col gap-2 items-center border-2 border-gray-300 rounded-lg p-4 hover:border-primary peer-checked:border-primary transition-all duration-200"
										onClick={(e) => {
											e.preventDefault();
											onUpdatePriorityProvider(
												priorityProvider === suppliers[key]?.id ? null : suppliers[key]?.id,
												priorityProviderDiscount,
												priorityProviderDiscountType
											);
										}}
									>
										<input
											type="radio"
											name="preferred_provider"
											value={key}
											className="sr-only peer"
											checked={priorityProvider === suppliers[key]?.id}
											readOnly={true}
										/>

										{suppliers[key]?.logo &&
											<ProviderLogo logo={suppliers[key]?.logo} className="w-8 h-8" />
										}

										<span className="text-lg font-medium text-gray-900">
											{suppliers[key]?.name}
										</span>

										<div className="absolute top-2 right-2 hidden peer-checked:block">
											<CheckCircleIcon className="w-6 h-6 text-primary" />
										</div>

										<p className="text-sm text-gray-5400 text-center">
											{suppliers[key]?.description}
										</p>

										<p className="text-xs text-primary font-medium peer-checked:block hidden">
											{__( 'Currently chosen as your preferred provider', 'fraktvalg')}
										</p>
									</label>
								))}
							</div>

							<Button type="button" onClick={storePriorityProvider}>
								{__( 'Save preferred provider preferences', 'fraktvalg')}
							</Button>
						</div>
					</div>
				}
			</div>
		</Wrapper>
	)
}
