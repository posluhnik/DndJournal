import type { DrawingHistory, Stroke } from "./types";

export const emptyDrawing: DrawingHistory = {
	past: [],
	present: [],
	future: [],
};

function commit(history: DrawingHistory, present: Stroke[]): DrawingHistory {
	return {
		past: [...history.past, history.present].slice(-100),
		present,
		future: [],
	};
}

export function appendStroke(
	history: DrawingHistory,
	stroke: Stroke,
): DrawingHistory {
	return commit(history, [...history.present, stroke]);
}

export function clearDrawing(history: DrawingHistory): DrawingHistory {
	return history.present.length ? commit(history, []) : history;
}

export function undoDrawing(history: DrawingHistory): DrawingHistory {
	if (!history.past.length) return history;
	return {
		past: history.past.slice(0, -1),
		present: history.past[history.past.length - 1],
		future: [history.present, ...history.future],
	};
}

export function redoDrawing(history: DrawingHistory): DrawingHistory {
	if (!history.future.length) return history;
	return {
		past: [...history.past, history.present],
		present: history.future[0],
		future: history.future.slice(1),
	};
}
