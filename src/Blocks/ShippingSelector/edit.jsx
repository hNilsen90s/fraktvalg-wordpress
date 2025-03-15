import {useEffect, useState} from '@wordpress/element';
import {useBlockProps, InspectorControls} from '@wordpress/block-editor';
import {__} from '@wordpress/i18n';
import {
    PanelBody,
    PanelRow,
    ButtonGroup,
    Button,
    __experimentalVStack as VStack,
    ColorPicker,
    ColorIndicator
} from '@wordpress/components';

import './style.pcss';
import {TruckIcon} from "@heroicons/react/24/outline";
import exampleData from './utils/exampleShipper.json';
import ShippingMethods from "./Components/ShippingMethods";
import Shippers from "./Components/Shippers";
import Loading from "./Components/Loading";

export function Edit({attributes, setAttributes}) {
	const {primaryColor = '#2F463E', secondaryColor = '#4D8965', tertiaryColor = '#65C7A4', editorMode = 'single'} = attributes;
	const [selectedShipper, setSelectedShipper] = useState(null);
	const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [shippers, setShippers] = useState({});
	const [activeColorPicker, setActiveColorPicker] = useState(null);

	const blockProps = useBlockProps();

	// Create a style object for dynamic colors
	const colorStyles = {
		'--fraktvalg-primary-color': primaryColor,
		'--fraktvalg-secondary-color': secondaryColor,
		'--fraktvalg-tertiary-color': tertiaryColor,
	};

	const selectShippingMethod = (method) => {
		setSelectedShippingMethod(method?.rate_id);
	};

	const handleShipperSelect = (shipper) => {
		if (editorMode === 'multiple') return; // Prevent selection in multiple mode
		setSelectedShipper(shipper);
	};

	useEffect(() => {
		// In editor mode, use example data
		const data = exampleData[editorMode];
		if (data) {
			const shippersWithIcons = data.map(shipper => ({
				...shipper,
				shippingOptions: shipper.shippingOptions.map(option => ({
					...option,
					icon: <TruckIcon className="w-10 h-10 mr-4" style={{color: 'var(--fraktvalg-tertiary-color)'}}/>
				}))
			}));
			setShippers(shippersWithIcons);
			setSelectedShipper(null);
			setSelectedShippingMethod(null);
			setIsLoading(false);
		}
	}, [editorMode]);

	const renderContent = () => (
		<>
			{shippers.length === 1 ? (
				<ShippingMethods
					methods={shippers[0].shippingOptions}
					setSelectedShipper={setSelectedShipper}
					selectedShippingMethod={selectedShippingMethod}
					onSelectMethod={selectShippingMethod}
				/>
			) : (
				<>
					<Shippers
						shippers={shippers}
						onSelectShipper={handleShipperSelect}
						selectedShippingMethod={selectedShippingMethod}
						editorMode={editorMode}
					/>
					{selectedShipper && editorMode !== 'multiple' && (
						<ShippingMethods
							methods={selectedShipper.shippingOptions}
							setSelectedShipper={setSelectedShipper}
							selectedShippingMethod={selectedShippingMethod}
							onSelectMethod={selectShippingMethod}
						/>
					)}
				</>
			)}
		</>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Preview Settings', 'fraktvalg')} initialOpen={true}>
					<PanelRow>
						<VStack spacing={2}>
							<p className="text-sm">{__('Preview Mode:', 'fraktvalg')}</p>
							<ButtonGroup>
								<Button
									variant={editorMode === 'single' ? 'primary' : 'secondary'}
									onClick={() => setAttributes({editorMode: 'single'})}
								>
									{__('Shipping methods', 'fraktvalg')}
								</Button>
								<Button
									variant={editorMode === 'multiple' ? 'primary' : 'secondary'}
									onClick={() => setAttributes({editorMode: 'multiple'})}
								>
									{__('Shipping providers', 'fraktvalg')}
								</Button>
							</ButtonGroup>
						</VStack>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={__('Color Settings', 'fraktvalg')} initialOpen={true}>
					<PanelRow>
						<VStack spacing={4}>
							<div className="flex items-center gap-2">
								<ColorIndicator colorValue={primaryColor} />
								<Button
									variant="link"
									onClick={() => setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')}
								>
									{__('Primary Color', 'fraktvalg')}
								</Button>
							</div>
							{activeColorPicker === 'primary' && (
								<ColorPicker
									color={primaryColor}
									onChange={(color) => setAttributes({primaryColor: color})}
									enableAlpha={false}
								/>
							)}

							<div className="flex items-center gap-2">
								<ColorIndicator colorValue={secondaryColor} />
								<Button
									variant="link"
									onClick={() => setActiveColorPicker(activeColorPicker === 'secondary' ? null : 'secondary')}
								>
									{__('Secondary Color', 'fraktvalg')}
								</Button>
							</div>
							{activeColorPicker === 'secondary' && (
								<ColorPicker
									color={secondaryColor}
									onChange={(color) => setAttributes({secondaryColor: color})}
									enableAlpha={false}
								/>
							)}

							<div className="flex items-center gap-2">
								<ColorIndicator colorValue={tertiaryColor} />
								<Button
									variant="link"
									onClick={() => setActiveColorPicker(activeColorPicker === 'tertiary' ? null : 'tertiary')}
								>
									{__('Tertiary Color', 'fraktvalg')}
								</Button>
							</div>
							{activeColorPicker === 'tertiary' && (
								<ColorPicker
									color={tertiaryColor}
									onChange={(color) => setAttributes({tertiaryColor: color})}
									enableAlpha={false}
								/>
							)}
						</VStack>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps} style={colorStyles}>
				{isLoading ? <Loading/> : renderContent()}
			</div>
		</>
	);
}
