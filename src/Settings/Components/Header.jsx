import Logo from '../../../assets/fraktvalg.svg';
import {clsx} from "clsx";

export default function Header({ tabs, activeTab, setTab }) {
	return (
		<div className="border-b border-gray-200 bg-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<nav>
					<div className="flex h-16 justify-between">
						<div className="flex">
							<div className="flex shrink-0 items-center">
								<img className="block h-8 w-auto" src={Logo} alt=""/>
							</div>

							<div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
								{tabs.map((tab) => (
									<button
										key={tab.value}
										type="button"
										className={clsx(
											"border-transparent text-gray-500 hover:text-secondary hover:border-secondary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
											tab.value === activeTab ? "text-primary border-primary" : ""
										)}
										onClick={ () => setTab( tab.value ) }
									>
										{tab.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</nav>
			</div>
		</div>
	);
}
