import { useId } from "react";
import type { JournalItem } from "../../types";
import type { ManualMaterials } from "./manualMaterials";
import "./manualMaterials.css";

export function ManualMaterialsField({
	value,
	onChange,
	backpackItems,
	parsed,
}: {
	value: string;
	onChange: (value: string) => void;
	backpackItems: readonly JournalItem[];
	parsed: ManualMaterials;
}) {
	const hintId = useId();
	const first = backpackItems[0]?.name ?? "Exact backpack item name";
	const second = backpackItems[1]?.name ?? "Another backpack item name";
	const placeholder = `One material per line: quantity x item name\n2 x ${first}\n1 x ${second}`;

	return (
		<div className="manual-materials-field">
			<label>
				Materials
				<textarea
					name="materials"
					value={value}
					onChange={(event) => onChange(event.currentTarget.value)}
					placeholder={placeholder}
					rows={4}
					aria-describedby={hintId}
				/>
			</label>
			<p id={hintId} className="manual-materials-hint">
				Use the item name from your backpack. Matching names link when you save;
				unknown names stay unlinked.
			</p>
			{parsed.lines.length > 0 && (
				<ul className="manual-materials-preview" aria-label="Material links">
					{parsed.lines.map((line, index) => (
						<li
							key={index}
							className={line.status === "linked" ? "is-linked" : "is-unlinked"}
						>
							<span>{line.text}</span>
							<small>{line.message}</small>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
