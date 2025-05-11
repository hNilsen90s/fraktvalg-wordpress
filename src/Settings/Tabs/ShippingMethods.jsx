import Wrapper from "../Components/Wrapper";
import ProviderLogo from "../../Components/ProviderLogo";
import React, {useEffect, useState} from "react";
import {ArrowLeftIcon, ArrowPathIcon} from "@heroicons/react/24/solid";
import {__} from "@wordpress/i18n";
import apiFetch from '@wordpress/api-fetch';
import Button from "../../FormElements/Button";
import Notification from "../../Components/Notifications";

export default function ShippingMethods({supplier, setTab}) {
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [shippingMethods, setShippingMethods] = useState([]);
	const [saveStatus, setSaveStatus] = useState(null);

	useEffect(() => {
		let timeout;
		if (saveStatus) {
			timeout = setTimeout(() => {
				setSaveStatus(null);
			}, 3000); // Clear after 3 seconds
		}
		return () => clearTimeout(timeout);
	}, [saveStatus]);

	const saveShippingMethods = () => {
		setIsSaving(true);
		setSaveStatus(null);

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/methods/store',
			method: 'POST',
			data: {
				shipper_id: supplier.id,
				fields: shippingMethods,
			}
		}).then((response) => {
			setSaveStatus('success');
			setIsSaving(false);
		}).catch((error) => {
			setSaveStatus('error');
			setIsSaving(false);
		});
	}

	useEffect( () => {
		setIsLoading(true);

		apiFetch({
			path: 'fraktvalg/v1/settings/providers/methods',
			method: 'POST',
			data: {
				shipper_id: supplier.id,
			}
		}).then((response) => {
			setShippingMethods(response);
			setIsLoading(false);
		});
	}, [] );

	const title = () => {
		return (
			<div className="flex justify-between">
				<div className="flex items-center gap-2">
					{supplier?.logo &&
						<div>
							<ProviderLogo logo={supplier?.logo} alt={supplier?.name} className="w-8 h-8 mr-2"/>
						</div>
					}

					<div className="inline-flex items-center gap-4">
						<span>
							{supplier?.name}
						</span>
					</div>
				</div>

				<div>
					<Button type="button" onClick={() => setTab('providers')} className="text-sm">
						<ArrowLeftIcon className="h-4 w-4 mr-2 inline-block"/>
						{__('Back to providers', 'fraktvalg')}
					</Button>
				</div>
			</div>
		)
	}

	return (
		<Wrapper title={title()}>
			{saveStatus === 'success' && (
				<Notification type="success" className="mb-4">
					{__('Shipping methods saved successfully!', 'fraktvalg')}
				</Notification>
			)}
			{saveStatus === 'error' && (
				<Notification type="error" className="mb-4">
					{__('Failed to save shipping methods. Please try again.', 'fraktvalg')}
				</Notification>
			)}

			{isLoading &&
				<div className="flex flex-col justify-center items-center h-64">
					<ArrowPathIcon className="h-8 w-8 animate-spin text-primary"/>
					<div className="text-lg">
						{__('Loading shipping methods...', 'fraktvalg')}
					</div>
				</div>
			}

			{!isLoading && shippingMethods.length === 0 &&
				<Notification>
					{__('This provider does not offer any shipping methods that can be modified.', 'fraktvalg')}
				</Notification>
			}

			{!isLoading && shippingMethods.length > 0 &&
				<>
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{__('Active', 'fraktvalg')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{__('Name', 'fraktvalg')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{__('Price', 'fraktvalg')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{__('Free shipping', 'fraktvalg')}
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{shippingMethods.map((method, index) => (
								<tr key={method.id}>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										<label>
											<input type="checkbox" checked={method.active} onChange={() => {
												const updatedMethods = [...shippingMethods];
												updatedMethods[index].active = !updatedMethods[index].active;
												setShippingMethods(updatedMethods);
											}}/>
											<span className="ml">{__('Active', 'fraktvalg')}</span>
										</label>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										<div className="flex flex-col">
											<small className="text-gray-500">{method.originalName}</small>
											<input type="text" value={method.name} onChange={(e) => {
												const updatedMethods = [...shippingMethods];
												updatedMethods[index].name = e.target.value;
												setShippingMethods(updatedMethods);
											}} className="border border-gray-300 rounded-md p-2"/>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
										<div className="flex flex-col gap-1">
											<label>
												<span className="mr-2">
													{__('Set a fixed price for this shipping method', 'fraktvalg')}
												</span>
												<input type="checkbox" checked={method.canEditPrice} onChange={() => {
													const updatedMethods = [...shippingMethods];
													updatedMethods[index].canEditPrice = !updatedMethods[index].canEditPrice;
													setShippingMethods(updatedMethods);
												}}/>
											</label>

											<input type="number" value={method.price || ''} disabled={!method.canEditPrice}
												   onChange={(e) => {
													   const updatedMethods = [...shippingMethods];
													   updatedMethods[index].price = e.target.value;
													   setShippingMethods(updatedMethods);
												   }} className="border border-gray-300 rounded-md p-2"/>

										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
										<div className="flex flex-col gap-1">
											<label>
												<span className="mr-2">
													{__('Free shipping if order total is over', 'fraktvalg')}
												</span>
												<input type="checkbox" checked={method.hasFreeShipping} onChange={() => {
													const updatedMethods = [...shippingMethods];
													updatedMethods[index].hasFreeShipping = !updatedMethods[index].hasFreeShipping;
													setShippingMethods(updatedMethods);
												}}/>
											</label>

											<input type="number" value={method.freeShippingThreshold || ''} disabled={!method.hasFreeShipping}
												   onChange={(e) => {
													   const updatedMethods = [...shippingMethods];
													   updatedMethods[index].freeShippingThreshold = e.target.value;
													   setShippingMethods(updatedMethods);
												   }} className="border border-gray-300 rounded-md p-2"/>

										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
						<Button 
							type="button" 
							onClick={() => saveShippingMethods()} 
							className="md:inline-block md:w-fit"
							disabled={isSaving}
						>
							{isSaving ? (
								<>
									<ArrowPathIcon className="h-4 w-4 mr-2 inline-block animate-spin"/>
									{__('Saving...', 'fraktvalg')}
								</>
							) : (
								__('Save shipping overrides', 'fraktvalg')
							)}
						</Button>
					</div>
				</>
			}
		</Wrapper>
	)
}
