import React, { useState } from 'react';

export default function InputNumber({ name, label, value = '', placeholder = '', required = false, callback, children, ...props }) {
	const [ number, setNumber ] = useState( value ?? 0 );

	const increaseNumber = () => {
		setNumber( number + 1 );
	}

	const decreaseNumber = () => {
		if ( number > 0 ) {
			setNumber( number - 1 );
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
					onChange={callback}
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
