import React from "react";
import { createRoot } from 'react-dom/client';
import "./Settings/fraktvalg.pcss"; // Import styles for Tailwind CSS
import Shipping from './Shipping/index';

const domNode = document.getElementById('fraktvalg-label-meta-box');

// Check that the DOM node exists before rendering
if (domNode) {
	const root = createRoot(domNode);
	root.render( <Shipping /> );
}
