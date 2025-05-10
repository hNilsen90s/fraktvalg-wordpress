import { __ } from '@wordpress/i18n';

function Step( { current  = false, future = false, past = false, setStep = null, label = null, step } ) {
	const classes = 'flex items-center justify-center w-8 h-8 border-2 border-gray-300 bg-white rounded-full shrink-0' +
		( current ? ' border-primary text-primary' : '' ) +
		( future ? '' : '' ) +
		( past ? ' border-primary/80 text-primary/90' : '' );

	const wrapperClasses = 'flex items-center text-custom space-x-2.5' +
		( setStep !== null && past === true ? ' cursor-pointer' : '' );

	const onClick = () => {
		if ( past === true && setStep !== null ) {
			setStep( step );
		}
	}

	return (
		<li className={ wrapperClasses } onClick={onClick}>
			<span
				className={ classes }>
				<span className="font-medium">
					{current ? <strong>{step}</strong> : step}
				</span>
			</span>

			{ label &&
				<span>
					<div className="font-medium leading-tight">
						{current ? <strong>{label}</strong> : label}
					</div>
				</span>
			}
		</li>
	)
}

export default function StepCounter({currentStep, steps, labels, setStep = null, ...props}) {
	return (
		<div className="mb-10">
			<span className="sr-only">
				{__('Step', 'fraktvalg')} {currentStep} {__('of', 'fraktvalg')} {steps}
			</span>
			<ol className="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 sm:justify-center max-w-2xl mx-auto">
				{[...Array(steps)].map((_, index) => (
					<Step
						key={index}
						current={index + 1 === currentStep}
						past={(index + 1) < currentStep}
						future={(index + 1) > currentStep}
						setStep={setStep}
						step={index + 1}
						label={labels[index]}
					/>
				))}
			</ol>
		</div>
	)
}
