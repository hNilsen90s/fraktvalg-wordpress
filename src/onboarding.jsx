import React from "react";
import { createRoot } from 'react-dom/client';
import "./Settings/fraktvalg.pcss"; // Import styles for Tailwind CSS
import Onboarding from "./Onboarding/index";

const domNode = document.getElementById('fraktvalg-onboarding');

// Check that the DOM node exists before rendering
if (domNode) {
	const root = createRoot(domNode);
	root.render( <Onboarding /> );
}
