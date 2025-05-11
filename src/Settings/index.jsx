import React from 'react';
import { useState } from 'react';
import { __, _x } from '@wordpress/i18n';

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
			label: _x('My providers', 'Tab label', 'fraktvalg'),
			value: 'providers',
		},
		{
			label: _x('Optional settings', 'Tab label', 'fraktvalg'),
			value: 'settings',
		},
		{
			label: _x('Support', 'Tab label', 'fraktvalg'),
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
