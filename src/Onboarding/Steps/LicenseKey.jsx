import React from 'react';
import { useState } from 'react';

import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import Button from "../../FormElements/Button";
import Notification from "../../Components/Notifications";
import {ChevronRightIcon, InformationCircleIcon} from "@heroicons/react/24/solid";

export default function LicenseKey({nextStep}) {
	const [ apiKey, setApiKey ] = useState( '' );
	const [ notice, setNotice ] = useState( null );

	const testApiKey = () => {
		setNotice( null );

		apiFetch({
			path: '/fraktvalg/v1/settings/api-key',
			method: 'POST',
			data: {
				api_key: apiKey
			}
		}).then((response) => {
			nextStep();
		}).catch((error) => {
			setNotice( {
				type: 'error',
				title: __( 'An error was encountered when validating your API key', 'fraktvalg' ),
				message: error?.message,
			} );
		});
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-xl font-semibold text-gray-900">
					{ __( 'Activate license', 'fraktvalg' ) }
				</h2>
				<p className="mt-1 text-sm text-gray-500">
					{ __( 'Your license will be activated for the domain: ', 'fraktvalg' ) + window.location.host }
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
				<div className="md:col-span-3 bg-white rounded-lg border border-gra-200 p-6">
					<div className="space-y-4">
						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="license">
								{ __( 'License key', 'fraktvalg' ) }
							</label>

							<input type="text" name="license" id="license" value={apiKey}
							   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
							   placeholder={ __( 'Enter your license key', 'fraktvalg' ) }
							   onChange={(e) => setApiKey(e.target.value)}/>
						</div>

						{ notice &&
							<Notification type={ notice.type } title={ notice.title } className="my-2">
								{ notice.message }
							</Notification>
						}

						<div className="w-full mt-1">
							<Button onClick={ testApiKey } disabled={ ! apiKey.length > 0 }>
								{ __( 'Activate license', 'fraktvalg' ) }
							</Button>
						</div>
					</div>
				</div>

				<div className="md:col-span-2 bg-tertiary/10 rounded-lg p-6 flex flex-col">
					<div className="flex items-center space-x-2 text-custom mb-4">
						<InformationCircleIcon className="w-5 h-5" />
						<span className="font-medium">
							{ __( 'Need a license?', 'fraktvalg' ) }
						</span>
					</div>

					<p className="text-sm text-gray-600 mb-4">
						{ __( 'To use Fraktvalg you first need to register an account. It only takes a moment to get started.', 'fraktvalg' ) }
					</p>

					<a href="https://Fraktvalg.no?utm_source=plugin&utm_medium=register&utm_campaign=onboarding"
					   className="mt-auto group inline-flex items-center text-cuistom hover:text-custom-dark font-medium">
						<span>{ __( 'Register at fraktvalg.no', 'fraktvalg' ) }</span>
						<ChevronRightIcon className="ml-1 w-4 h-4" />
					</a>
				</div>
			</div>
		</div>
	)
}
