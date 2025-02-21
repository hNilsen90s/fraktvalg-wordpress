import React from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState } from 'react';
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/solid";
import InputNumber from "../../FormElements/InputNumber";
import InputText from "../../FormElements/InputText";
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
			undersell: 10,
			custom: {
				name: __( 'Shipping & handling', 'fraktvalg' ),
				price: 100,
			}
		},
		names: [],
	} );

	const setOption = ( event ) => {
		switch ( event.target.name ) {
			case 'freight[addedCost]':
				setOptions( { ...options, freight: { ...options.freight, addedCost: event.target.value } } );
				break;
			case 'freight[undersell]':
				setOptions( { ...options, freight: { ...options.freight, undersell: event.target.value } } );
				break;
			case 'freight[custom][name]':
				setOptions( { ...options, freight: { ...options.freight, custom: { ...options.freight.custom, name: event.target.value } } } );
				break;
			case 'freight[custom][price]':
				setOptions( { ...options, freight: { ...options.freight, custom: { ...options.freight.custom, price: event.target.value } } } );
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
			})

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
						{ __( 'If Fraktvalg should ever become unavailable, create a shipping alternative that will be used instead.', 'fraktvalg' ) }
					</p>

					<InputText label={ __( 'Shipping option name', 'fraktvalg' ) } name="freight[custom][name]" value={options.freight.custom.name} callback={setOption} />

					<InputNumber label={ __( 'Shipping option cost' ) } name="freight[custom][price]" value={options.freight.custom.price} callback={setOption} />
				</div>
			</AccordionSection>

			<AccordionSection title={ __( 'Shipping cost adjustments', 'fraktvalg' ) }>
				<div className="relative grid grid-cols-1 gap-4">
					<p>
						{ __( 'Safeguard your shipping costs with these optional alternatives.', 'fraktvalg' ) }
					</p>

					<div>
						<InputNumber label={ __( 'Add an optional surcharge to all shipping options', 'fraktvalg' ) } name="freight[addedCost]"
									 value={options.freight.addedCost} callback={setOption}>
							<p className="text-xs italic">
								{ __( 'Additional shipping surcharges are meant to cover administrative- and handling costs, and is automatically added to all shipping alternatives.', 'fraktvalg' ) }
							</p>
						</InputNumber>
					</div>

					<div>
						<InputNumber label={ __( 'Fixed discount for prioritized shipping providers', 'fraktvalg' ) } name="freight[undersell]"
									 value={options.freight.undersell} callback={setOption}>
							<p className="text-xs italic">
								{ __( 'If you have chosen a prioritized shipping provider, they will always be cheaper than the competitors by the amount specified here.', 'fraktvalg' ) }
							</p>
						</InputNumber>
					</div>
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
