import { registerBlockType } from '@wordpress/blocks';

import { registerCheckoutBlock } from '@woocommerce/blocks-checkout';

import metadata from './block.json';

import {Edit} from "./edit";
import Block from "./block";

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: () => null,
});

registerCheckoutBlock({
	metadata: metadata,
	component: Block
});
