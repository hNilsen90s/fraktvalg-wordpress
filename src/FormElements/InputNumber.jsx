import React, { useState } from 'react';

export default function InputNumber({ name, label, value = '', placeholder = '', required = false, callback, onChange, children, ...props }) {
	const [ number, setNumber ] = useState( Number.isInteger( value ) ? value : parseInt( value, 10 ) || 0 );

	// Use onChange if provided, otherwise fall back to callback for backward compatibility
	const handleChange = onChange || callback;

	const increaseNumber = () => {
		setNumber( number + 1 );
		if (handleChange) {
			// Create a synthetic event object
			const event = { target: { value: number + 1 } };
			handleChange(event);
		}
	}

	const decreaseNumber = () => {
		if ( number > 0 ) {
			setNumber( number - 1 );
			if (handleChange) {
				// Create a synthetic event object
				const event = { target: { value: number - 1 } };
				handleChange(event);
			}
		}
	}

	const handlePaste = (event) => {
		// Get the pasted value
		const pastedValue = event.clipboardData.getData('text');
		// Convert to number
		const numericValue = parseInt(pastedValue, 10);

		// Only update if it's a valid number
		if (!isNaN(numericValue) && numericValue >= 0) {
			setNumber(numericValue);
			if (handleChange) {
				// Create a synthetic event object
				const event = { target: { value: numericValue } };
				handleChange(event);
			}
		}
	}

	return (
		<div>
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-gray-700">{label}</label>
				<input
					name={name}
					type="number"
					value={number}
					onChange={handleChange}
					onPaste={handlePaste}
					placeholder={placeholder}
					required={required}
					min="0"
					className="hidden"
				/>

				<div className="inline-flex items-center gap-4">
					<button onClick={decreaseNumber} className="px-2 py-1 font-mono text-lg text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100">-</button>

					<span className="text-lg font-mono font-semibold">
						{number}
					</span>

					<button onClick={increaseNumber} className="px-2 py-1 font-mono text-lg text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100">+</button>
				</div>
			</div>

			{children}
		</div>
	);
}
