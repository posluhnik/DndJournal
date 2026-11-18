export type DrawingAction =
	| "pen"
	| "eraser"
	| "smaller"
	| "larger"
	| "undo"
	| "redo"
	| "clear"
	| "expand"
	| "collapse"
	| "help";

type KeyInput = Pick<
	KeyboardEvent,
	"key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey"
>;

export function drawingAction(event: KeyInput): DrawingAction | null {
	if (event.altKey) return null;
	const key = event.key.toLowerCase();
	if (event.ctrlKey || event.metaKey) {
		if (key === "z") return event.shiftKey ? "redo" : "undo";
		if (key === "y") return "redo";
		if (key === "delete" && event.shiftKey) return "clear";
		return null;
	}
	if (key === "b") return "pen";
	if (key === "e") return "eraser";
	if (key === "[") return "smaller";
	if (key === "]") return "larger";
	if (key === "f") return "expand";
	if (key === "escape") return "collapse";
	if (key === "?") return "help";
	return null;
}

export const shortcutDescriptions = [
	{ keys: "B", label: "Pen" },
	{ keys: "E", label: "Eraser" },
	{ keys: "[ / ]", label: "Smaller / larger brush" },
	{ keys: "Ctrl + Z", label: "Undo" },
	{ keys: "Ctrl + Shift + Z / Ctrl + Y", label: "Redo" },
	{ keys: "Ctrl + Shift + Delete", label: "Clear all (undoable)" },
	{ keys: "F / Esc", label: "Expand / collapse canvas" },
	{ keys: "?", label: "Show shortcuts" },
];
