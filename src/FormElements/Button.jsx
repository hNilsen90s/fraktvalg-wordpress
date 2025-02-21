import {clsx} from "clsx";

export default function Button({ disabled = false, plain = false, className, children, onClick = () => {}, ...props }) {
	const classes = clsx(
		'block w-full bg-primary text-white rounded-md p-3',
		'hover:bg-primary/90 hover:text-white',
		'active:bg-primary/90 active:text-white',
		'focus:bg-primary/90 focus:text-white',
		'disabled:bg-black/80',
		className
	);

	if ( props.href ) {
		return (
			<a
			   className={ classes }
			   { ...props }
			>
				{ children }
			</a>
		);
	}

	return (
		<button onClick={ onClick }
				disabled={ disabled }
				className={ classes }
				{ ...props }
		>
			{ children }
		</button>
	);
}
