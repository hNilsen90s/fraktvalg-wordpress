export default function FieldDescription({ children }) {
	return (
		<div className="w-full mt-2 bg-gray-50 rounded-lg p-5 help-content border border-gray-200 space-y-4">
			<div className="text-sm text-gray-600">
				{children}
			</div>
		</div>
	);
}
