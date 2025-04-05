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
			if (syntheticEvent.target.type === 'checkbox') {
				setFieldValues({ ...fieldValues, [syntheticEvent.target.name]: syntheticEvent.target.checked });
			} else {
				setFieldValues({ ...fieldValues, [syntheticEvent.target.name]: syntheticEvent.target.value });
			}
			
			callback(provider, fieldValues);
			return;
		}
		
		// Handle regular change events
		if (event.target.type === 'checkbox') {
			setFieldValues({ ...fieldValues, [event.target.name]: event.target.checked });
		} else {
			setFieldValues({ ...fieldValues, [event.target.name]: event.target.value });
		}

		callback(provider, fieldValues);
	}

	useEffect(() => {
		fields.forEach( field => {
			if ( field?.value ) {
				setFieldValues( { ...fieldValues, [ field.name ]: field.value } );
			}
		} );
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
