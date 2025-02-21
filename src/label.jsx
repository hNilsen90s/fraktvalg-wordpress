import React from "react";
import { createRoot } from 'react-dom/client';
import Label from "./Label";

const domNode = document.getElementById('fraktvalg-label-meta-box');

// Check that the DOM node exists before rendering
if (domNode) {
	const root = createRoot(domNode);
	root.render( <Label /> );
}
