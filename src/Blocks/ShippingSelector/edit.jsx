import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Disabled, PanelBody, ColorPicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import Block from "./block";

export function Edit( { attributes, setAttributes } ) {
	const { className, primaryColor = '#2F463E', secondaryColor = '#4D8965', tertiaryColor = '#65C7A4' } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Color Settings', 'fraktvalg')} initialOpen={true}>
					<div className="mb-4">
						<p className="mb-2">{__('Primary Color', 'fraktvalg')}</p>
						<ColorPicker
							color={primaryColor}
							onChange={(color) => setAttributes({ primaryColor: color })}
							enableAlpha={false}
						/>
					</div>
					<div className="mb-4">
						<p className="mb-2">{__('Secondary Color', 'fraktvalg')}</p>
						<ColorPicker
							color={secondaryColor}
							onChange={(color) => setAttributes({ secondaryColor: color })}
							enableAlpha={false}
						/>
					</div>
					<div className="mb-4">
						<p className="mb-2">{__('Tertiary Color', 'fraktvalg')}</p>
						<ColorPicker
							color={tertiaryColor}
							onChange={(color) => setAttributes({ tertiaryColor: color })}
							enableAlpha={false}
						/>
					</div>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<Disabled>
					<Block isEditor={ true } className={ className } attributes={ attributes } />
				</Disabled>
			</div>
		</>
	)
}
