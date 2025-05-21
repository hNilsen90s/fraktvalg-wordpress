import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Notification from '../../Components/Notifications';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

export default function Booking({ setActiveView, dataAttributes, setDataAttributes }) {
    const [error, setError] = useState(null);
    const [errorCount, setErrorCount] = useState(0);

    const createConsignment = () => {
        // Clear any existing error when trying again
        setError(null);

        apiFetch({
            path: '/fraktvalg/v1/woocommerce/create-consignment',
            method: 'POST',
            data: {
                order_id: dataAttributes.order_id
            }
        })
        .then(response => {
            // Reset error count on success
            setErrorCount(0);
            // Update data attributes with new shipment ID
            setDataAttributes({
                ...dataAttributes,
                'fraktvalg_shipment_id': response.shipment_id
            });
            // Switch to label view
            setActiveView('label');
        })
        .catch(error => {
            setErrorCount(prev => prev + 1);
            setError(
                error.error 
                    ? `${error.error} ${__('Please try again.', 'fraktvalg')}`
                    : __('Failed to create consignment. Please try again.', 'fraktvalg')
            );
        });
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="space-y-2">
                    <Notification type="error">{error}</Notification>
                    {errorCount >= 2 && (
                        <p className="text-sm text-gray-600">
                            <InformationCircleIcon className="w-4 h-4 inline-block mr-1" />
                            {__('If this error persists, you may need to generate this consignment manually.', 'fraktvalg')}
                        </p>
                    )}
                </div>
            )}
            <button
                type="button"
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded w-full"
                onClick={createConsignment}
            >
                { __( 'Create consignment booking', 'fraktvalg' ) }
            </button>
        </div>
    );
} 