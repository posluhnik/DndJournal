import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

export function Modal({
	title,
	onClose,
	children,
	className = "",
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
	className?: string;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog && !dialog.open) dialog.showModal();
	}, []);

	return (
		<dialog
			ref={dialogRef}
			className={`item-dialog ${className}`.trim()}
			aria-labelledby={titleId}
			onCancel={(event) => {
				event.stopPropagation();
				onClose();
			}}
		>
			<header className="dialog-header">
				<h2 id={titleId}>{title}</h2>
				<button
					className="close-button"
					type="button"
					onClick={onClose}
					aria-label={`Close ${title.toLowerCase()}`}
				>
					×
				</button>
			</header>
			{children}
		</dialog>
	);
}
