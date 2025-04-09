export function GetShipperRates( cart, shipper ) {
	let rates = [];

	cart?.shipping_rates?.forEach( ( cartPackage ) => {
		cartPackage?.shipping_rates?.forEach( ( rate ) => {
			if ( ! rate?.meta_data?.some( meta => meta.key === 'fraktvalg' ) ) {
				return;
			}

			let rateGroup = rate?.rate_id.split( ':' )[0];
			let options = rate?.meta_data.find( meta => meta.key === 'option' )?.value;

			let delivery = options?.delivery?.estimatedDate || new Date().toISOString().split('T')[0];

			if ( rateGroup === shipper.id ) {
				rates.push( {
					rate_id: rate?.rate_id,
					name: options?.texts?.displayName || rate?.name,
					description: options?.texts?.description,
					price: rate?.price,
					icon: options?.delivery?.serviceCode,
					selected: rate?.selected || false,
					delivery: {
						date: delivery,
						days: Math.max(1, Math.ceil((new Date(delivery) - new Date()) / (1000 * 60 * 60 * 24))),
					}
				} );
			}
		} );
	} );

	return rates;
}
