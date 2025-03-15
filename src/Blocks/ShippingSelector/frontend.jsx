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
        // Get the attributes from the data attribute
        let attributes = {};
        try {
            const attributesString = domNode.getAttribute('data-attributes');
            if (attributesString) {
                attributes = JSON.parse(attributesString);
            }
        } catch (e) {
            console.error('Error parsing Fraktvalg block attributes:', e);
        }

        const root = createRoot(domNode);
        root.render(<Block attributes={attributes} />);
    } else if (retries < maxRetries) {
        retries++;
        setTimeout(checkDomNode, 1000);
    }
};

checkDomNode();
