import { useCallback } from "react";
import { useJournalState } from "../../lib/journalStore";
import {
	appendStroke,
	clearDrawing,
	emptyDrawing,
	redoDrawing,
	undoDrawing,
} from "./history";
import type { DrawingHistory, Stroke } from "./types";

export function useDrawingHistory(page: string) {
	const [pages, setPages] = useJournalState<Record<string, DrawingHistory>>(
		"drawings",
		{},
	);
	const update = useCallback(
		(change: (history: DrawingHistory) => DrawingHistory) => {
			setPages((current) => ({
				...current,
				[page]: change(current[page] ?? emptyDrawing),
			}));
		},
		[page],
	);
	const onStroke = useCallback(
		(stroke: Stroke) => update((history) => appendStroke(history, stroke)),
		[update],
	);
	const onUndo = useCallback(() => update(undoDrawing), [update]);
	const onRedo = useCallback(() => update(redoDrawing), [update]);
	const onClear = useCallback(() => update(clearDrawing), [update]);
	return {
		drawing: pages[page] ?? emptyDrawing,
		onStroke,
		onUndo,
		onRedo,
		onClear,
	};
}
