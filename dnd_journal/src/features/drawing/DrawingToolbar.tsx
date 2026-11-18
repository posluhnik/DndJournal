import { Icon } from "../../Icons";
import type { DrawingTool } from "./types";

type Props = {
	tool: DrawingTool;
	setTool: (tool: DrawingTool) => void;
	size: number;
	setSize: (size: number) => void;
	color: string;
	setColor: (color: string) => void;
	canUndo: boolean;
	canRedo: boolean;
	canClear: boolean;
	expanded: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onClear: () => void;
	onExpand: () => void;
	onHelp: () => void;
};

export function DrawingToolbar(props: Props) {
	return (
		<div className="drawing-toolbar" aria-label="Drawing tools">
			<div className="tool-group">
				<button
					className="icon-button"
					type="button"
					title="Pen (B)"
					aria-label="Pen"
					aria-pressed={props.tool === "pen"}
					onClick={() => props.setTool("pen")}
				>
					<Icon name="pen" />
				</button>
				<button
					className="icon-button"
					type="button"
					title="Eraser (E)"
					aria-label="Eraser"
					aria-pressed={props.tool === "eraser"}
					onClick={() => props.setTool("eraser")}
				>
					<Icon name="eraser" />
				</button>
				<span className="tool-divider" />
				<button
					className="icon-button"
					type="button"
					title="Undo (Ctrl+Z)"
					aria-label="Undo"
					disabled={!props.canUndo}
					onClick={props.onUndo}
				>
					<Icon name="undo" />
				</button>
				<button
					className="icon-button"
					type="button"
					title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
					aria-label="Redo"
					disabled={!props.canRedo}
					onClick={props.onRedo}
				>
					<Icon name="redo" />
				</button>
			</div>
			<div className="brush-controls">
				<label className="brush-size">
					Size
					<input
						type="number"
						min="1"
						max="64"
						step="1"
						value={props.size}
						aria-label="Brush size"
						onChange={(event) => {
							if (Number.isFinite(event.currentTarget.valueAsNumber))
								props.setSize(event.currentTarget.valueAsNumber);
						}}
					/>
					<span>px</span>
				</label>
				<input
					className="brush-color"
					type="color"
					aria-label="Brush color"
					title="Brush color"
					value={props.color}
					onChange={(event) => props.setColor(event.currentTarget.value)}
				/>
			</div>
			<div className="tool-group toolbar-end">
				<button
					className="clear-button"
					type="button"
					title="Clear all (Ctrl+Shift+Delete). Can be undone."
					disabled={!props.canClear}
					onClick={props.onClear}
				>
					<Icon name="trash" size={15} />
					<span>Clear all</span>
				</button>
				<button
					className="icon-button"
					type="button"
					title="Keyboard shortcuts (?)"
					aria-label="Keyboard shortcuts"
					onClick={props.onHelp}
				>
					<Icon name="help" size={17} />
				</button>
				<button
					className="icon-button"
					type="button"
					title={props.expanded ? "Collapse canvas (Esc)" : "Expand canvas (F)"}
					aria-label={props.expanded ? "Collapse canvas" : "Expand canvas"}
					aria-pressed={props.expanded}
					onClick={props.onExpand}
				>
					<Icon name="expand" />
				</button>
			</div>
		</div>
	);
}
