import React from 'react';
import { useState } from 'react';

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
			label: 'My providers',
			value: 'providers',
		},
		{
			label: 'Optional settings',
			value: 'settings',
		},
		{
			label: 'Support',
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
