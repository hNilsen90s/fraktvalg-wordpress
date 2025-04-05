export default function InputPassword({ name, label, value = '', placeholder = '', required = false, callback, children }) {
	return (
		<div>
			<label className="block text-sm font-medium text-gray-700">{label}</label>
			<input
				name={name}
				type="password"
				value={value}
				onChange={callback}
				onPaste={callback}
				placeholder={placeholder}
				required={required}
				className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
			/>
			{children}
		</div>
	);
}
