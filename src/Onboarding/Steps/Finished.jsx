import {CheckCircleIcon} from "@heroicons/react/24/solid";
import Button from "../../FormElements/Button";
import { __ } from '@wordpress/i18n';

export default function Finished({ nextStep }) {
	return (
		<div className="flex flex-col justify-center items-center gap-4">
			<div>
				<CheckCircleIcon className="w-20 h-20 text-primary" />
			</div>
			<span className="text-2xl text-center">
				{ __( 'Fraktvalg is now set up and ready to use.', 'fraktvalg' ) }
			</span>

			<Button onClick={() => nextStep()}>
				{ __( 'Finish setup', 'fraktvalg' ) }
			</Button>
		</div>
	)
}
