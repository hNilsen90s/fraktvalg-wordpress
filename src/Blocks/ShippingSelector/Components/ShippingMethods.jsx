import { __ } from '@wordpress/i18n';

import {ArrowLeftIcon, CheckCircleIcon} from "@heroicons/react/24/solid";
import {clsx} from "clsx";
import {formatShippingPrice} from "../utils/formatShippingPrice";

export default function ShippingMethods({
	methods,
	selectedShippingMethod,
	onSelectMethod,
	setSelectedShipper,
	showReturnButton = true,
	isEditor = false,
	isLoading = false
}) {
	return (
		<div className="py-4">
			{ showReturnButton && (
				<button
					className="mb-4 px-4 py-2 pl-0 transition-all bg-transparent hover:text-secondary rounded-lg"
					onClick={() => setSelectedShipper(null)}
					disabled={isEditor || isLoading}
					style={{
						opacity: (isEditor || isLoading) ? 0.5 : 1,
						cursor: (isEditor || isLoading) ? 'not-allowed' : 'pointer',
					}}
				>
					<ArrowLeftIcon className="w-4 h-4 inline-block mr-2" />
					{ __( 'Return to shipping providers', 'fraktvalg' ) }
				</button>
			) }

			<div className="flex flex-col gap-2" role="radiogroup" aria-label={__('Shipping methods', 'fraktvalg')}>
				{methods.map((option, index) => (
					<button
						key={index}
						type="button"
						role="radio"
						aria-checked={option?.rate_id === selectedShippingMethod}
						className={clsx(
							"w-full text-left border border-solid rounded-lg p-4 flex flex-col sm:flex-row transition-all duration-300 items-center justify-between",
							{
								'cursor-pointer hover:bg-tertiary/10 hover:shadow-md': !isLoading,
								'cursor-not-allowed opacity-50': isLoading && option?.rate_id !== selectedShippingMethod
							}
						)}
						onClick={() => !isLoading && onSelectMethod(option)}
						onKeyDown={(e) => {
							if (!isLoading && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault();
								onSelectMethod(option);
							}
						}}
						disabled={isLoading && option?.rate_id !== selectedShippingMethod}
					>
						<div className="flex items-center w-full">
							<div className="flex-shrink-0">
								{ option?.rate_id === selectedShippingMethod
									? <CheckCircleIcon className="w-10 h-10 mr-4 text-primary inline-block" />
									: option?.icon && option.icon
								}
							</div>
							<div className="flex flex-col gap-1 flex-grow">
								<span 
									className="text-md font-semibold"
									dangerouslySetInnerHTML={{ __html: option.name }}
								/>
								<span className="text-sm italic">
									{option.description}
								</span>
								
								<div className="flex justify-between gap-2 w-full">
									<p className="text-sm text-nowrap text-gray-600 flex items-center">
										{option.shippingTime}
									</p>

									<p className="text-md text-nowrap font-medium mt-2 sm:mt-0">
										{ formatShippingPrice( option.price ) }
									</p>
								</div>
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	)
}
