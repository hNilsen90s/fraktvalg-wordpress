import { __ } from "@wordpress/i18n";

import Wrapper from "../Components/Wrapper";
import Button from "../../FormElements/Button";

import {ChatBubbleLeftRightIcon, LifebuoyIcon} from "@heroicons/react/24/solid";

export default function Support({}) {
	return (
		<Wrapper title="Support">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div className="grid grid-cols-1 gap-3 bg-tertiary/10 p-5 rounded-md">
					<h2 className="text-lg font-semibold">
						{ __( 'Fraktvalg support', 'fraktvalg' ) }
					</h2>

					<p className="text-sm">
						{ __( 'For help with the Fraktvalg API, your subscription, or other questions, please contact us directly.', 'fraktvalg' ) }
					</p>

					<div className="justify-end align-bottom">
						<Button href="mailto:hei@fraktvalg.no"
								className="inline-flex items-center gap-3">
							<LifebuoyIcon className="w-4 h-4 inline-block"/>
							{ __( 'Contact Fraktvalg support', 'fraktvalg' ) }
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3 bg-tertiary/10 p-5 rounded-md">
					<h2 className="text-lg font-semibold">
						{ __( 'Community support', 'fraktvalg' ) }
					</h2>

					<p className="text-sm">
						{ __( 'If you are having trouble with WordPress, or using the plugin, please use the community support forums at WordPress.org.', 'fraktvalg' ) }
					</p>

					<div className="justify-end align-bottom">
						<Button href="https://wordpress.org/support/plugin/fraktvalg/"
								className="inline-flex items-center gap-3">
							<ChatBubbleLeftRightIcon className="w-4 h-4 inline-block"/>
							{ __( 'Visit the WordPress.org support forums', 'fraktvalg' ) }
							<span className="sr-only">
								{ __( 'External link, opens in a new tab', 'frakt' ) }
							</span>
						</Button>
					</div>
				</div>
			</div>
		</Wrapper>
	)
}
