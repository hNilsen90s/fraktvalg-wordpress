import React from 'react';
import { useState } from 'react';

import Logo from '../../assets/fraktvalg.svg';

import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import "./onboarding.pcss";
import LicenseKey from "./Steps/LicenseKey";
import Providers from "./Steps/Providers";
import Finished from "./Steps/Finished";
import StepCounter from "../Components/StepCounter";
import OptionalSettings from "./Steps/OptionalSettings";
import Templates from "./Steps/Templates";
import StoreSettings from "./Steps/StoreSettings";

export default function Onboarding() {
	const [ step, setStep ] = useState(1);

	const stepLabels = [
		__( 'License', 'fraktvalg' ),
		__( 'Providers', 'fraktvalg' ),
		__( 'Templates', 'fraktvalg' ),
		__( 'Plugin Settings', 'fraktvalg' ),
		__( 'Store Settings', 'fraktvalg' ),
		__( 'Finished', 'fraktvalg' ),
	]

	// If step exceeds the totalSteps, then we wish to end the onboarding renderer.
	if ( step > stepLabels.length ) {
		// Take the user to the dashboard.
		apiFetch({
			path: '/fraktvalg/v1/onboarding/complete',
			method: 'POST',
		}).then( () => {
			window.location.href = 'index.php';
		});
	}

	const nextStep = () => {
		setStep(step + 1);
	}

	return (
		<div className="top-0 left-0 w-full">
			<div className="flex justify-center p-8 mt-16">
				<div className="grid gap-8">
					<div className="m-auto">
						<img src={ Logo } alt="Fraktvalg logo" />
					</div>

					<StepCounter currentStep={ step } steps={ stepLabels.length } labels={ stepLabels } setStep={ setStep } />

					<div className="max-w-5xl bg-white rounded-lg shadow p-6">
						{ step === 1 && <LicenseKey nextStep={ nextStep } /> }
						{ step === 2 && <Providers nextStep={ nextStep } /> }
						{ step === 3 && <Templates nextStep={ nextStep } /> }
						{ step === 4 && <OptionalSettings nextStep={ nextStep } /> }
						{ step === 5 && <StoreSettings nextStep={ nextStep } /> }
						{ step === 6 && <Finished nextStep={ nextStep } /> }
					</div>
				</div>
			</div>
		</div>
	)
}
