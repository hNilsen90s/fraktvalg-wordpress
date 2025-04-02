import React, { useState, useEffect } from "react";
import { ArrowPathIcon, CheckCircleIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import Button from "../../FormElements/Button";
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export default function Templates({ nextStep }) {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ templates, setTemplates ] = useState( {} );
	const [ visitedUrls, setVisitedUrls ] = useState( {
		cart: false,
		checkout: false
	} );
	const [ isCreating, setIsCreating ] = useState( {
		cart: false,
		checkout: false
	} );
	const [ autoConfigured, setAutoConfigured ] = useState( {
		cart: false,
		checkout: false
	} );

	useEffect( () => {
		checkThemeStatus();
	}, [] );

	const checkThemeStatus = async () => {
		try {
			const response = await apiFetch( {
				path: '/fraktvalg/v1/onboarding/theme-status',
				method: 'GET',
			} );

			setTemplates( response );
			setIsLoading( false );
		} catch ( error ) {
			console.error( 'Error checking theme status:', error );
			setIsLoading( false );
		}
	};

	const handleTemplateAction = async ( type, action ) => {
		if ( action === 'create' ) {
			// Create template with automatic block injection
			setIsCreating( prev => ({ ...prev, [ type ]: true }));
			try {
				await apiFetch( {
					path: '/fraktvalg/v1/onboarding/create-template',
					method: 'POST',
					data: { template: type }
				} );
				// Refresh theme status to get the new URL
				await checkThemeStatus();
				// Mark as auto-configured
				setAutoConfigured( prev => ({ ...prev, [ type ]: true }));
			} catch ( error ) {
				console.error( 'Error creating template:', error );
			} finally {
				setIsCreating( prev => ({ ...prev, [ type ]: false }));
			}
		} else if ( action === 'edit' ) {
			// Edit existing template
			const url = templates.urls[ type ];
			if ( url ) {
				window.open( url, '_blank' );
				setVisitedUrls( prev => ({
					...prev,
					[ type ]: true
				}));
			}
		}
	};

	if ( isLoading ) {
		return (
			<div className="flex flex-col justify-center items-center h-64">
				<ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
				<div className="text-lg">
					{ __( 'Checking which templates are in use on this site...', 'fraktvalg' ) }
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 p-6">
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-4">
					{ __( 'Template Configuration', 'fraktvalg' ) }
				</h2>
				<p className="text-gray-600 mb-6">
					{ templates.blockTheme 
						? __( 'Your theme uses block templates. Choose how you want to add the Fraktvalg block to your templates:', 'fraktvalg' )
						: __( 'Your theme does not use block templates. You can proceed to the next step without configuring any templates.', 'fraktvalg' )
					}
				</p>
			</div>

			{ templates.blockTheme && templates.urls && (
				<ul className="space-y-4">
					{ templates.urls.cart !== undefined && (
						<li className="flex flex-col p-4 bg-white rounded-lg shadow-sm border">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center">
									<span className="font-medium">
										{ __( 'Cart Template', 'fraktvalg' ) }
									</span>
									{ visitedUrls.cart && (
										<CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
									)}
								</div>
							</div>
							<div className="flex gap-4">
								<button
									onClick={ () => handleTemplateAction( 'cart', 'create' ) }
									disabled={ isCreating.cart || autoConfigured.cart }
									className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{ isCreating.cart ? (
										<>
											<ArrowPathIcon className="h-4 w-4 animate-spin inline mr-2" />
											{ __( 'Creating...', 'fraktvalg' ) }
										</>
									) : autoConfigured.cart ? (
										<>
											<CheckCircleIcon className="h-4 w-4 inline mr-2" />
											{ __( 'Block Auto-added', 'fraktvalg' ) }
										</>
									) : (
										<>
											<CheckCircleIcon className="h-4 w-4 inline mr-2" />
											{ __( 'Auto-add Block', 'fraktvalg' ) }
										</>
									)}
								</button>
								<button
									onClick={ () => handleTemplateAction( 'cart', 'edit' ) }
									className="flex-1 px-4 py-2 bg-white text-primary border border-primary rounded hover:bg-gray-50 transition-colors"
								>
									<PencilSquareIcon className="h-4 w-4 inline mr-2" />
									{ __( 'Customize Manually', 'fraktvalg' ) }
								</button>
							</div>
						</li>
					)}
					{ templates.urls.checkout !== undefined && (
						<li className="flex flex-col p-4 bg-white rounded-lg shadow-sm border">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center">
									<span className="font-medium">
										{ __( 'Checkout Template', 'fraktvalg' ) }
									</span>
									{ visitedUrls.checkout && (
										<CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
									)}
								</div>
							</div>
							<div className="flex gap-4">
								<button
									onClick={ () => handleTemplateAction( 'checkout', 'create' ) }
									disabled={ isCreating.checkout || autoConfigured.checkout }
									className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{ isCreating.checkout ? (
										<>
											<ArrowPathIcon className="h-4 w-4 animate-spin inline mr-2" />
											{ __( 'Creating...', 'fraktvalg' ) }
										</>
									) : autoConfigured.checkout ? (
										<>
											<CheckCircleIcon className="h-4 w-4 inline mr-2" />
											{ __( 'Block Auto-added', 'fraktvalg' ) }
										</>
									) : (
										<>
											<CheckCircleIcon className="h-4 w-4 inline mr-2" />
											{ __( 'Auto-add Block', 'fraktvalg' ) }
										</>
									)}
								</button>
								<button
									onClick={ () => handleTemplateAction( 'checkout', 'edit' ) }
									className="flex-1 px-4 py-2 bg-white text-primary border border-primary rounded hover:bg-gray-50 transition-colors"
								>
									<PencilSquareIcon className="h-4 w-4 inline mr-2" />
									{ __( 'Customize Manually', 'fraktvalg' ) }
								</button>
							</div>
						</li>
					)}
				</ul>
			)}

			<Button type="button" onClick={nextStep}>
				{ __( 'Next step', 'fraktvalg' ) }
			</Button>
		</div>
	);
}
