import { useState, useEffect } from 'react';
import { ArrowPathIcon } from "@heroicons/react/24/solid";

import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

export default function Modal({ setIsModalOpen }) {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ labelImageUrl, setLabelImageUrl ] = useState( null );

	const orderId = new URLSearchParams( window.location.search ).get( 'id' );

	const printLabel = () => {
		if (labelImageUrl) {
			const printWindow = window.open('', '_blank');
			printWindow.document.write(`
                <html>
                    <head><title>${ __( 'Print', 'fraktvalg' ) }</title></head>
                    <body class="flex justify-center items-center min-h-screen">
                        <img src="${labelImageUrl}" class="max-w-full h-auto">
                    </body>
                </html>
            `);
			printWindow.document.close();
			printWindow.print();
		}
	};

	useEffect( () => {
		setIsLoading( true );
		apiFetch( {
			path: 'fraktvalg/v1/woocommerce/shipping-label',
			method: 'POST',
			data: {
				order_id: orderId,
			}
		} ).then( ( response ) => {
			setLabelImageUrl( response?.url || null );
		}).finally( () => {
			setIsLoading( false );
		});
	}, [])

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[999999]">
			<div className="relative bg-white p-6 rounded-md shadow-lg w-96">
				<button
					type="button"
					className="absolute top-0 right-1 text-gray-600 hover:text-gray-900 text-xl font-bold"
					onClick={() => setIsModalOpen(false)}>
					&times;
				</button>

				{isLoading ? (
					<div className="flex justify-center items-center">
						<ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : labelImageUrl ? (
					<>
						<img
							src={labelImageUrl}
							alt="Shipping Label"
							className="max-w-full w-full h-auto mb-4 shadow-lg"
						/>
						<button
							type="button"
							className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
							onClick={printLabel}>
							{ __( 'Print', 'fraktvalg' ) }
						</button>
					</>
				) : (
					<p className="text-red-500 text-center">
						{ __( 'Failed to load shipping label.', 'fraktvalg' ) }
					</p>
				)}
			</div>
		</div>
	)
}
