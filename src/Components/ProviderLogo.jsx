import {TruckIcon} from "@heroicons/react/24/outline";

export default function ProviderLogo({logo = null, ...props}) {
	const { alt = '' } = props;

	if ( ! logo ) {
		return <TruckIcon { ...props } />;
	}

	if ( logo.startsWith( 'http' ) ) {
		return (
			<img src={ logo } alt={ alt } { ...props } />
		);
	}

	if ( logo.startsWith( 'data:image' ) ) {
		return (
			<img src={ logo } alt={ alt } { ...props } />
		);
	}

	if ( ! logo.startsWith( 'https' ) ) {
		logo = encodeURIComponent( logo );
	}

	return (
		<img src={'data:image/svg+xml;utf8,' + logo } alt={ alt } { ...props } />
	);
}
