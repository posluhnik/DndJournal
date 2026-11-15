import type { ReactNode } from "react";

export type IconName =
	| "journal"
	| "backpack"
	| "recipe"
	| "plus"
	| "minus"
	| "search"
	| "pen"
	| "eraser"
	| "undo"
	| "redo"
	| "expand"
	| "more"
	| "shop"
	| "trash"
	| "help";

const iconPaths: Record<IconName, ReactNode> = {
	shop: (
		<>
			<path d="M3 10h18l-2-7H5l-2 7ZM5 10v11h14V10M9 21v-7h6v7M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
		</>
	),
	trash: (
		<>
			<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
		</>
	),
	help: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 17h.01" />
		</>
	),
	journal: (
		<>
			<path d="M5 3h13a2 2 0 0 1 2 2v16H6a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Z" />
			<path d="M7 3v14M3 17h17M11 7h5M11 11h3" />
		</>
	),
	backpack: (
		<>
			<path d="M8 7V5a4 4 0 0 1 8 0v2M7 7h10a3 3 0 0 1 3 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a3 3 0 0 1 3-3Z" />
			<rect x="7" y="13" width="10" height="5" rx="1" />
			<path d="M10 10h4" />
		</>
	),
	recipe: (
		<>
			<path d="M9 3h6M10 3v6L4 19a1.3 1.3 0 0 0 1.2 2h13.6a1.3 1.3 0 0 0 1.2-2L14 9V3M8 14h8" />
			<path d="M9 18h.01M14 17h.01" />
		</>
	),
	plus: <path d="M12 5v14M5 12h14" />,
	minus: <path d="M5 12h14" />,
	search: (
		<>
			<circle cx="10.5" cy="10.5" r="6.5" />
			<path d="m16 16 4.5 4.5" />
		</>
	),
	pen: (
		<>
			<path d="m15 4 5 5M4 15l-1 6 6-1L21 8a2 2 0 0 0 0-3l-2-2a2 2 0 0 0-3 0Z" />
			<path d="m4 15 5 5" />
		</>
	),
	eraser: (
		<path d="m4 12 9-9a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3L11 21H7l-4-4a3 3 0 0 1 1-5ZM8 8l9 9M11 21h10" />
	),
	undo: <path d="M4 9h10a6 6 0 0 1 0 12M4 9l5-5M4 9l5 5" />,
	redo: <path d="M20 9H10a6 6 0 0 0 0 12M20 9l-5-5M20 9l-5 5" />,
	expand: <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />,
	more: (
		<>
			<circle cx="12" cy="5" r=".8" />
			<circle cx="12" cy="12" r=".8" />
			<circle cx="12" cy="19" r=".8" />
		</>
	),
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{iconPaths[name]}
		</svg>
	);
}
