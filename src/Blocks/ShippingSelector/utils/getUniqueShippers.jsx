import { __ } from '@wordpress/i18n';

export function GetUniqueShippers( cart ) {
	let shippers = [];
	let rateOptions = {},
		rateGroup = null,
		rateGroupDetails = {},
		existingShipper = null;

	cart?.shipping_rates?.forEach( ( cartPackage ) => {
		cartPackage?.shipping_rates?.forEach( ( rate ) => {
			if ( ! rate?.meta_data?.some( meta => meta.key === 'fraktvalg' ) ) {
				return;
			}

			rateOptions = rate?.meta_data?.find( meta => meta.key === 'option' )?.value || {};

			rateGroup = rate?.rate_id.split( ':' )[0];

			if ( ! shippers.some( shipper => shipper.id === rateGroup ) ) {
				rateGroupDetails = rate?.meta_data.find( meta => meta.key === 'option' )?.value || {};

				shippers.push( {
					id: rateGroup,
					details: {
						label: rateOptions?.texts?.shipperName,
						quickestShippingTime: __( '2 business days', 'fraktvalg' ),
						LowestPrice: rate.price,
					},
					shippingOptions: [],
					...rateGroupDetails,
				} );
			} else {
				existingShipper = shippers.find(shipper => shipper.id === rateGroup);

				if (existingShipper && rate.price < existingShipper.details.LowestPrice) {
					existingShipper.details.LowestPrice = rate.price;
				}
			}
		} );
	} );

	return shippers;
}
