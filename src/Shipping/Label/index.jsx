import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import Modal from "./Modal";

export default function Label({ orderId }) {
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	return (
		<>
			<button
				type="button"
				className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded w-full"
				onClick={() => { setIsModalOpen(true) }}>
				{ __( 'Fetch & print shipping label', 'fraktvalg' ) }
			</button>

			{ isModalOpen &&
				<Modal setIsModalOpen={ setIsModalOpen } orderId={orderId} />
			}
		</>
	)
} 