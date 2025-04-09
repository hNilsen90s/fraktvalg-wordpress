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

			<div className="flex flex-col gap-2">
				{methods.map((option, index) => (
					<div
						key={index}
						className={ clsx(
							"border rounded-lg p-4 flex flex-col sm:flex-row transition-all duraction-300 items-center justify-between",
							{
								'cursor-pointer hover:bg-tertiary/10 hover:shadow-md': !isLoading,
								'cursor-not-allowed opacity-50': isLoading && option?.rate_id !== selectedShippingMethod
							}
						) }
						onClick={() => !isLoading && onSelectMethod(option)}>
						<div className="flex items-center">
							<div className="flex-grow">
								{ option?.rate_id === selectedShippingMethod
									? <CheckCircleIcon className="w-10 h-10 mr-4 text-primary inline-block" />
									: option?.icon && option.icon
								}
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-md font-semibold">
									{option.name}
								</span>
								<span className="text-sm italic">
									{option.description}
								</span>
								
								<div className="flex justify-between gap-2">
									<p className="text-sm text-nowrap text-gray-600 flex items-center">
										{option.shippingTime}
									</p>

									<p className="text-md text-nowrap font-medium mt-2 sm:mt-0">
										{ formatShippingPrice( option.price ) }
									</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
