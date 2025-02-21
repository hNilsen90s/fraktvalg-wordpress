import { useBlockProps } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';

import Block from "./block";

export function Edit( { attributes } ) {
	const { className } = attributes;
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<Disabled>
				<Block isEditor={ true } className={ className } />
			</Disabled>
		</div>
	)
}
