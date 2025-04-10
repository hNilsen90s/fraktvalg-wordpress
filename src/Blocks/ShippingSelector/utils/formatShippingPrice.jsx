export const formatShippingPrice = (price) => {
	if (typeof wc.priceFormat.formatPrice === 'function') {
		return wc.priceFormat.formatPrice( price );
	} else {
		return (price / 100).toFixed(0);
	}
}
