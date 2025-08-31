import React, { useState } from 'react';

export default function InputNumber({ name, label, value = 0, required = false, callback, onChange, children, ...props }) {

	// Use onChange if provided, otherwise fall back to callback for backward compatibility
	const handleChange = onChange || callback;

	const increaseNumber = () => {
		const newNumber = value + 1;

		if (handleChange) {
			// Create a synthetic event object
			const customEvent = {
				target: {
					type: 'number',
					name: name,
					value: newNumber
				}
			};

			handleChange(customEvent);
		}
	}

	const decreaseNumber = (event) => {
		let newNumber = value - 1;
		if ( newNumber < 0 ) {
			newNumber = 0;
		}

		if (handleChange) {
			// Create a synthetic event object
			const customEvent = {
				target: {
					type: 'number',
					name: name,
					value: newNumber
				}
			};

			handleChange(customEvent);
		}
	}

	return (
		<div>
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-gray-700">{label}</label>
				<input
					name={name}
					type="number"
					value={value}
					onChange={handleChange}
					required={required}
					min="0"
					className="hidden"
				/>

				<div className="inline-flex items-center gap-4">
					<button onClick={decreaseNumber} className="px-2 py-1 font-mono text-lg text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100">-</button>

					<span className="text-lg font-mono font-semibold">
						{value}
					</span>

					<button onClick={increaseNumber} className="px-2 py-1 font-mono text-lg text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100">+</button>
				</div>
			</div>

			{children}
		</div>
	);
}
