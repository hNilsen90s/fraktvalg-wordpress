import { registerCheckoutBlock } from '@woocommerce/blocks-checkout';

import metadata from './block.json';

import Block from "./block";
import {createRoot} from "react-dom/client";
import React from "react";

registerCheckoutBlock( {
    metadata: metadata,
    component: () => <Block />,
} );

const domNodeId = 'fraktvalg-shipping';
const maxRetries = 60;
let retries = 0;

const checkDomNode = () => {
    const domNode = document.getElementById(domNodeId);

    if (domNode) {
        const root = createRoot(domNode);
        root.render(<Block />);
    } else if (retries < maxRetries) {
        retries++;
        setTimeout(checkDomNode, 1000);
    }
};

checkDomNode();
