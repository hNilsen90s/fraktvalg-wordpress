import { __ } from "@wordpress/i18n";

import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function Loading({ text = __( 'Fetching the best shipping options...', 'fraktvalg' ) }) {
	return (
		<div className="flex flex-col justify-center items-center h-64">
			<ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
			<div className="text-lg">
				{ text }
			</div>
		</div>
	);
}
