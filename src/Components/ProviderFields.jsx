import { useState, useEffect } from 'react';

import { __ } from '@wordpress/i18n';

import InputBoolean from "../FormElements/InputBoolean";
import InputPassword from "../FormElements/InputPassword";
import InputText from "../FormElements/InputText";
import InputNumber from "../FormElements/InputNumber";
import {ChevronRightIcon} from "@heroicons/react/24/solid";
import {InformationCircleIcon} from "@heroicons/react/24/outline";
import FieldDescription from "../FormElements/FieldDescription";

export default function ProviderFields({ includeOptional = false, provider, fields, callback }) {
	const [ fieldValues, setFieldValues ] = useState( {} );
	const [ showExplanations, setShowExplanations ] = useState( {} );
	const [ lastPastedField, setLastPastedField ] = useState( null );

	const setFieldValueCallback = ( event ) => {
		// Handle paste events
		if (event.type === 'paste') {
			// Create a synthetic event that mimics the onChange event
			const syntheticEvent = {
				target: {
					name: event.target.name,
					value: event.clipboardData.getData('text'),
					type: event.target.type
				}
			};

			// Process the synthetic event
			const newFieldValues = { ...fieldValues };
			if (syntheticEvent.target.type === 'checkbox') {
				newFieldValues[syntheticEvent.target.name] = syntheticEvent.target.checked;
			} else {
				newFieldValues[syntheticEvent.target.name] = syntheticEvent.target.value;
			}

			// Update state and call callback with the new values
			setFieldValues(newFieldValues);
			callback(provider, newFieldValues);

			// Mark this field as just pasted to prevent handling the subsequent change event
			setLastPastedField(syntheticEvent.target.name);

			// Reset the lastPastedField after a short delay
			setTimeout(() => {
				setLastPastedField(null);
			}, 100);

			return;
		}

		// Skip handling change events for fields that were just pasted
		if (lastPastedField === event.target.name) {
			return;
		}

		// Handle regular change events
		const newFieldValues = { ...fieldValues };
		if (event.target.type === 'checkbox') {
			newFieldValues[event.target.name] = event.target.checked;
		} else {
			newFieldValues[event.target.name] = event.target.value;
		}

		setFieldValues(newFieldValues);
		callback(provider, newFieldValues);
	}

	useEffect(() => {
		const temporaryValueStore = {};
		let setValue;

		fields.forEach(field => {
			setValue = field?.value || field?.defaultValue || null;

			// Ensure the proper type based on field type.
			if (field.type === 'boolean') {
				setValue = Boolean(setValue);
			} else if (field.type === 'number') {
				setValue = Number.isInteger( setValue ) ? setValue : parseInt( setValue, 10 ) || 0;
			} else if (field.type === 'string' || field.type === 'text' || field.type === 'password') {
				setValue = setValue !== null ? String(setValue) : null;
			}

			temporaryValueStore[field.name] = setValue;
		});

		setFieldValues(temporaryValueStore);
	}, []);

	const getFieldType = ( field ) => {
		switch (field.type) {
			case 'boolean':
				return <InputBoolean
					name={field.name}
					label={field.label}
					value={fieldValues?.[field.name]}
					callback={ setFieldValueCallback }
					required={field.required}
					field={field}
				>
					<>
						{ field?.description &&
							<FieldDescription>
								{field?.description}
							</FieldDescription>
						}
					</>
				</InputBoolean>;
			case 'password':
				return <InputPassword
					name={field.name}
					label={field.label}
					value={fieldValues?.[field.name]}
					placeholder={field.placeholder}
					callback={ setFieldValueCallback }
					required={field.required}
					field={field}
				>
					<>
						{ field?.description &&
							<FieldDescription>
								{field?.description}
							</FieldDescription>
						}
					</>
				</InputPassword>;
			case 'number':
				return <InputNumber
					name={field.name}
					label={field.label}
					value={fieldValues?.[field.name]}
					placeholder={field.placeholder}
					callback={ setFieldValueCallback }
					required={field.required}
					field={field}
				>
					<>
						{ field?.description &&
							<FieldDescription>
								{field?.description}
							</FieldDescription>
						}
					</>
				</InputNumber>;
			case 'text':
			case 'string':
			default:
				return <InputText
					name={field.name}
					label={field.label}
					value={fieldValues?.[field.name]}
					placeholder={field.placeholder}
					callback={ setFieldValueCallback }
					required={field.required}
					field={field}
				>
					<>
						{ field?.description &&
							<FieldDescription>
								{field?.description}
							</FieldDescription>
						}
					</>
				</InputText>;
		}
	}

	const toggleExplanation = (fieldName) => {
		setShowExplanations(prev => ({
			...prev,
			[fieldName]: !prev[fieldName]
		}));
	};

	return (
		<>
			{fields.flatMap( (field, index) => {
				if ( field?.optional && ! includeOptional ) {
					return [];
				}

				return (
					<div key={ index }>
						{ getFieldType( field ) }
						{ field?.help &&
							<div className="mt-2">
								<button type="button"
										className="text-sm text-custom hover:text-custom-dark flex items-center cursor-pointer help-toggle"
										onClick={() => toggleExplanation(field.name)}
								>
									<InformationCircleIcon className="w-5 h-5 mr-1" />
									<span>
										{ field?.help?.label || __( 'Help', 'fraktvalg' ) }
									</span>
								</button>

								{ showExplanations[field.name] &&
									<FieldDescription>
										<p>
											{ field?.help?.text }
										</p>

										{ field?.help?.url?.link &&
											<div className="mt-3">
												<a href={ field?.help?.url?.link }
												   target="_blank"
												   className="inline-flex items-center text-custom hover:text-custom-dark font-medium">
													<span>
														{ field?.help?.url?.label }
													</span>
													<ChevronRightIcon className="ml-1 w-4 h-4" />
												</a>
											</div>
										}
									</FieldDescription>
								}
							</div>
						}
					</div>
				);
			})}
		</>
	);
}
