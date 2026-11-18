import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Modal } from "../../components/Modal";
import { DrawingToolbar } from "./DrawingToolbar";
import { renderDrawing } from "./renderDrawing";
import { shortcutDescriptions } from "./shortcuts";
import { useDrawingShortcuts } from "./useDrawingShortcuts";
import type { DrawingHistory, DrawingTool, Point, Stroke } from "./types";

type Props = {
	drawing: DrawingHistory;
	onStroke: (stroke: Stroke) => void;
	onUndo: () => void;
	onRedo: () => void;
	onClear: () => void;
};

export function DrawingWorkspace({
	drawing,
	onStroke,
	onUndo,
	onRedo,
	onClear,
}: Props) {
	const workspaceRef = useRef<HTMLElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const draftRef = useRef<Stroke | null>(null);
	const pointerRef = useRef<number | null>(null);
	const drawingRef = useRef(drawing);
	const [tool, setTool] = useState<DrawingTool>("pen");
	const [sizes, setSizes] = useState({ pen: 3, eraser: 20 });
	const [color, setColor] = useState("#252525");
	const [expanded, setExpanded] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const size = sizes[tool];
	drawingRef.current = drawing;

	function setSize(value: number) {
		setSizes((current) => ({
			...current,
			[tool]: Math.max(1, Math.min(64, Math.round(value))),
		}));
	}

	useDrawingShortcuts(
		workspaceRef,
		{
			pen: () => setTool("pen"),
			eraser: () => setTool("eraser"),
			smaller: () => setSize(size - 1),
			larger: () => setSize(size + 1),
			undo: onUndo,
			redo: onRedo,
			clear: onClear,
			expand: () => setExpanded((current) => !current),
			collapse: () => setExpanded(false),
			help: () => setShowHelp(true),
		},
		() => pointerRef.current === null,
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const observer = new ResizeObserver(() =>
			renderDrawing(canvas, drawingRef.current.present, draftRef.current),
		);
		observer.observe(canvas);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (canvasRef.current)
			renderDrawing(canvasRef.current, drawing.present, draftRef.current);
	}, [drawing]);

	function pointFromEvent(event: PointerEvent<HTMLCanvasElement>): Point {
		const bounds = event.currentTarget.getBoundingClientRect();
		return {
			x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
			y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
		};
	}

	function startStroke(event: PointerEvent<HTMLCanvasElement>) {
		if (event.button !== 0 || pointerRef.current !== null) return;
		event.preventDefault();
		event.currentTarget.focus({ preventScroll: true });
		event.currentTarget.setPointerCapture(event.pointerId);
		pointerRef.current = event.pointerId;
		draftRef.current = {
			tool,
			color,
			width: size / event.currentTarget.getBoundingClientRect().width,
			points: [pointFromEvent(event)],
		};
		renderDrawing(
			event.currentTarget,
			drawingRef.current.present,
			draftRef.current,
		);
	}

	function continueStroke(event: PointerEvent<HTMLCanvasElement>) {
		if (pointerRef.current !== event.pointerId || !draftRef.current) return;
		draftRef.current.points.push(pointFromEvent(event));
		renderDrawing(
			event.currentTarget,
			drawingRef.current.present,
			draftRef.current,
		);
	}

	function finishStroke(event: PointerEvent<HTMLCanvasElement>) {
		if (pointerRef.current !== event.pointerId || !draftRef.current) return;
		const stroke = draftRef.current;
		draftRef.current = null;
		pointerRef.current = null;
		onStroke(stroke);
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
	}

	return (
		<section
			ref={workspaceRef}
			className={`drawing-workspace panel${expanded ? " is-expanded" : ""}`}
			aria-label="Drawing workspace"
		>
			<canvas
				ref={canvasRef}
				tabIndex={0}
				className={`drawing-canvas tool-${tool}`}
				aria-label="Item drawing canvas"
				onPointerDown={startStroke}
				onPointerMove={continueStroke}
				onPointerUp={finishStroke}
				onPointerCancel={finishStroke}
				onLostPointerCapture={finishStroke}
			/>
			<DrawingToolbar
				tool={tool}
				setTool={setTool}
				size={size}
				setSize={setSize}
				color={color}
				setColor={setColor}
				canUndo={drawing.past.length > 0}
				canRedo={drawing.future.length > 0}
				canClear={drawing.present.length > 0}
				expanded={expanded}
				onUndo={onUndo}
				onRedo={onRedo}
				onClear={onClear}
				onExpand={() => setExpanded((current) => !current)}
				onHelp={() => setShowHelp(true)}
			/>
			{showHelp && (
				<Modal title="Canvas shortcuts" onClose={() => setShowHelp(false)}>
					<div className="shortcuts-content">
						<p>
							Click the canvas to use these shortcuts. Text fields keep their
							normal keyboard behavior.
						</p>
						<dl>
							{shortcutDescriptions.map(({ keys, label }) => (
								<div key={label}>
									<dt>{label}</dt>
									<dd>
										<kbd>{keys}</kbd>
									</dd>
								</div>
							))}
						</dl>
					</div>
					<footer className="dialog-footer">
						<button
							className="primary-button"
							type="button"
							onClick={() => setShowHelp(false)}
						>
							Close
						</button>
					</footer>
				</Modal>
			)}
		</section>
	);
}
