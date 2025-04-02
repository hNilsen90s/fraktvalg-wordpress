import {__} from '@wordpress/i18n';
import {TruckIcon, HomeIcon, ArchiveBoxIcon} from "@heroicons/react/24/outline";

/**
 * Get the appropriate icon component based on the shipping service code
 *
 * @param {string} serviceCode The shipping service code
 * @returns {JSX.Element|string} The icon component or translatable string
 */
export const getShippingIcon = (serviceCode) => {
    switch (serviceCode) {
        case 'Parcel':
            return <TruckIcon className="w-10 h-10 mr-4" style={{color: 'var(--fraktvalg-tertiary-color)'}}/>;
        case 'HomeDelivery':
            return <HomeIcon className="w-10 h-10 mr-4" style={{color: 'var(--fraktvalg-tertiary-color)'}}/>;
        case 'ServiceParcel':
            return <ArchiveBoxIcon className="w-10 h-10 mr-4" style={{color: 'var(--fraktvalg-tertiary-color)'}}/>;
        default:
            return <TruckIcon className="w-10 h-10 mr-4" style={{color: 'var(--fraktvalg-tertiary-color)'}}/>;
    }
}; 