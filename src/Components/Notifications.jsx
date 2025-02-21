import {clsx} from "clsx";

export default function Notification({ type = 'notice', title, children, className = '' }) {
	const classes = clsx(
		'border rounded-md p-2',
		type === 'success' ? 'bg-green-100 border-green-200' : '',
		type === 'notice' ? 'bg-yellow-100 border-yellow-200' : '',
		type === 'error' ? 'bg-red-100 border-red-200' : '',
		className
	);

	return (
		<div className={ classes }>
			<div className="text-md text-black font-semibold">
				{title}
			</div>
			{ children &&
				<div className="text-sm text-black">
					{children}
				</div>
			}
		</div>
	)
}
