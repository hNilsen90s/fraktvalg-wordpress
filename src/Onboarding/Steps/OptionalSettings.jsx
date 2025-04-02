import React from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState } from 'react';
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/solid";
import InputNumber from "../../FormElements/InputNumber";
import InputText from "../../FormElements/InputText";
import InputBoolean from "../../FormElements/InputBoolean";
import Button from "../../FormElements/Button";
import Notification from "../../Components/Notifications";

export function AccordionSection({ title, children, open = false }) {
	const [ isOpen, setIsOpen ] = useState( open || false );

	return (
		<div className="border bg-white rounded-md">
			<button className="w-full flex p-4 justify-between" onClick={ () => setIsOpen( ! isOpen ) }>
				<h2 className="text-lg text-left font-bold w-full">
					{title}
				</h2>

				<div className="relative inline-block">
					{
						isOpen
							? <ChevronUpIcon className="h-6 w-6 text-primary" />
							: <ChevronDownIcon className="h-6 w-6 text-primary" />
					}
				</div>
			</button>

			{isOpen &&
				<div className="p-4">
					{children}
				</div>
			}
		</div>
	)
}

export default function OptionalSettings({nextStep}) {
	const [ notice, setNotice ] = useState( null );
	const [ showNextButton, setShowNextButton ] = useState( false );
	const [ options, setOptions ] = useState({
		freight: {
			addedCost: 0,
			addedCostType: 'fixed',
			custom: {
				name: __( 'Shipping & handling', 'fraktvalg' ),
				price: 100,
				type: 'fixed',
			}
		},
		useProduction: true,
		names: [],
	} );

	const setOption = ( event ) => {
		switch ( event.target.name ) {
			case 'freight[addedCost]':
				setOptions( { ...options, freight: { ...options.freight, addedCost: event.target.value } } );
				break;
			case 'freight[addedCostType]':
				setOptions( { ...options, freight: { ...options.freight, addedCostType: event.target.value } } );
				break;
			case 'freight[custom][name]':
				setOptions( { ...options, freight: { ...options.freight, custom: { ...options.freight.custom, name: event.target.value } } } );
				break;
			case 'freight[custom][price]':
				setOptions( { ...options, freight: { ...options.freight, custom: { ...options.freight.custom, price: event.target.value } } } );
				break;
			case 'freight[custom][type]':
				setOptions( { ...options, freight: { ...options.freight, custom: { ...options.freight.custom, type: event.target.value } } } );
				break;
			case 'useProduction':
				setOptions( { ...options, useProduction: event.target.checked } );
				break;
			default:
				setOptions( { ...options, [event.target.name]: event.target.value } );
				break;
		}
	}

	const saveOptionalSettings = () => {
		setNotice( null );
		setShowNextButton( false );

		apiFetch({
			path: '/fraktvalg/v1/settings/optional-settings',
			method: 'POST',
			data: {
				options: options,
			},
		}).then((response) => {
			setNotice( {
				type: response?.type,
				title: response?.title,
				message: response?.message,
			} );

			setShowNextButton( true );
		}).catch((error) => {
			setNotice( {
				type: 'error',
				title: __( 'Error saving optional settings', 'fraktvalg' ),
				message: error?.message,
			} );
		});
	}

	return (
		<div className="grid grid-cols-1 gap-3">
			<span className="text-xl">
				{ __( 'Almost there! Are there any optional settings you would like to change?', 'fraktvalg' )}
			</span>

			<AccordionSection title={ __( 'Backup shipping option', 'fraktvalg' ) } open={true}>
				<div className="relative grid grid-cols-1 gap-4">
					<p>
						{ __( 'If Fraktvalg should ever become unavailable, or no shiopping options are returned, returns this shipping alternative by default.', 'fraktvalg' ) }
					</p>

					<div className="mt-2 grid grid-cols-1 gap-4">
						<InputText label={ __( 'Shipping option name', 'fraktvalg' ) } name="freight[custom][name]" value={options.freight.custom.name} callback={setOption} />

						<div className="flex items-center gap-3">
							<input name="freight[custom][price]" value={ options.freight.custom.price } onChange={ setOption } type="number" min="0" step="1" placeholder="25" className="w-16 border border-gray-300 rounded-md p-2" />
							<select name="freight[custom][type]" className="border border-gray-300 rounded-md p-2" value={ options.freight.custom.type } onChange={ setOption }>
								<option value="percent">%</option>
								<option value="fixed">NOK</option>
							</select>

							<div>
								<label htmlFor="something">
									{ __( 'Backup shipping cost', 'fraktvalg' ) }
								</label>
								<p className="text-xs italic">
									{ __( 'The backup shipping cost can be set to either a fixed value, or a percentage of the order total.', 'fraktvalg' ) }
								</p>
							</div>
						</div>
					</div>
				</div>
			</AccordionSection>

			<AccordionSection title={ __( 'Shipping cost adjustments', 'fraktvalg' ) }>
				{ __( 'Safeguard your shipping costs with these optional alternatives.', 'fraktvalg' ) }

				<div className="flex items-center gap-3">
					<input name="freight[addedCost]" value={ options.freight.addedCost } onChange={ setOption } type="number" min="0" step="1" placeholder="10" className="w-16 border border-gray-300 rounded-md p-2" />
					<select name="freight[addedCostType]" className="border border-gray-300 rounded-md p-2" value={ options.freight.addedCostType } onChange={ setOption }>
						<option value="percent">%</option>
						<option value="fixed">NOK</option>
					</select>

					<div>
						<label htmlFor="something">
							{ __( 'Add an optional surcharge to all shipping options', 'fraktvalg' ) }
						</label>
						<p className="text-xs italic">
							{ __( 'Additional shipping surcharges are meant to cover administrative- and handling costs, and is automatically added to all shipping alternatives.', 'fraktvalg' ) }
						</p>
					</div>
				</div>
			</AccordionSection>

			<AccordionSection title={ __( 'Shop environment', 'fraktvalg' ) } open={false}>
				<p>
					{ __( 'Some times, you wish to use the shipping providers test environments, for example on a staging site. Doing so will not create legitimate shipping requests, and prevents yo ufrom incurring charges while testing your store setup.', 'fraktvalg' ) }
				</p>

				<div className="mt-2 grid grid-cols-1 gap-4">
					<InputBoolean label={ __( 'Use production environments', 'fraktvalg' ) } name="useProduction" value={ options.useProduction } callback={ setOption } />
				</div>
			</AccordionSection>

			{ notice &&
				<Notification type={ notice.type } title={ notice.title }>
					{ notice.message }
				</Notification>
			}

			<Button type="button" onClick={ saveOptionalSettings }>
				{ __( 'Save optional settings', 'fraktvalg' ) }
			</Button>

			{ showNextButton &&
				<Button type="button" onClick={ nextStep }>
					{ __( 'Finish setup', 'fraktvalg' ) }
				</Button>
			}
		</div>
	);
}
