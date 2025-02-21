import { useState } from 'react';
import FieldDescription from "./FieldDescription";

export default function InputBoolean({ field, name, label, value = false, callback, required = false, children }) {
	const [ checked, setChecked ] = useState( value );

	const handleChange = ( event ) => {
		setChecked( event.target.checked );
		callback( event );
	}

	return (
		<div className="relative">
			<label className="inline-flex items-center cursor-pointer">
				<input
					name={name}
					type="checkbox"
					checked={ value }
					onChange={handleChange}
					required={required}
					className="sr-only peer"
				/>

				<div
					className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-200 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>

				<span className="ms-3 mr-2 text-sm">
					{label}
				</span>
			</label>

			{children}

			{ field?.stateDescriptions?.enabled && checked &&
				<FieldDescription>
					{field?.stateDescriptions?.enabled}
				</FieldDescription>
			}
			{ field?.stateDescriptions?.disabled && ! checked &&
				<FieldDescription>
					{field?.stateDescriptions?.disabled}
				</FieldDescription>
			}
		</div>
	);
}
