import React from 'react';
import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import "./fraktvalg.pcss";
import Header from "./Components/Header";
import Providers from "./Tabs/Providers";
import OptionalSettings from "./Tabs/OptionalSettings";
import Support from "./Tabs/Support";
import ShippingMethods from "./Tabs/ShippingMethods";

export default function Settings({}) {
	const [ tab, setTab ] = useState( 'providers' );
	const [ provider, setProvider ] = useState( null );
	const tabs = [
		{
			label: __('My providers', 'fraktvalg'),
			value: 'providers',
		},
		{
			label: __('Optional settings', 'fraktvalg'),
			value: 'settings',
		},
		{
			label: __('Support', 'fraktvalg'),
			value: 'support',
		},
	]

	return (
		<div className="min-h-full">
			<Header tabs={ tabs } activeTab={ tab } setTab={ setTab } />

			{ tab === 'providers' && <Providers setProvider={ setProvider } setTab={ setTab }/> }
			{ tab === 'shipping-methods' && <ShippingMethods supplier={ provider } setTab={ setTab } /> }
			{ tab === 'settings' && <OptionalSettings /> }
			{ tab === 'support' && <Support /> }
		</div>
	)
}
