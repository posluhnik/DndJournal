import type { FormEvent } from "react";
import { useState } from "react";
import type { JournalItem, Recipe } from "../../types";
import { Modal } from "../../components/Modal";
import { readName } from "../../lib/forms";
import { ManualMaterialsField } from "./ManualMaterialsField";
import { parseManualMaterials } from "./manualMaterials";

export function RecipeDialog({
	recipe,
	backpackItems = [],
	onSave,
	onClose,
}: {
	recipe?: Recipe;
	backpackItems?: readonly JournalItem[];
	onSave: (recipe: Recipe) => void;
	onClose: () => void;
}) {
	const [materials, setMaterials] = useState(recipe?.materials ?? "");
	const parsed = parseManualMaterials(materials, backpackItems);
	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const name = readName(form, data);
		if (!name) return;
		onSave({
			...recipe,
			id: recipe?.id ?? crypto.randomUUID(),
			name,
			materials: materials.trim(),
			output: String(data.get("output") ?? "").trim(),
			outputQuantity: Number(data.get("outputQuantity")),
			notes: String(data.get("notes") ?? ""),
			kind: "unknown",
			ingredients: parsed.ingredients.length ? parsed.ingredients : undefined,
			unresolvedMaterials: parsed.unresolved.length
				? parsed.unresolved
				: undefined,
		});
	}

	return (
		<Modal
			title={recipe ? "Edit unknown recipe" : "Create unknown recipe"}
			onClose={onClose}
		>
			<form onSubmit={submit}>
				<div className="dialog-fields">
					<label>
						Recipe name
						<input
							name="name"
							defaultValue={recipe?.name ?? ""}
							required
							autoFocus
							maxLength={120}
							onInput={(event) => event.currentTarget.setCustomValidity("")}
						/>
					</label>
					<ManualMaterialsField
						value={materials}
						onChange={setMaterials}
						backpackItems={backpackItems}
						parsed={parsed}
					/>
					<div className="form-columns recipe-output-fields">
						<label>
							Output item
							<input
								name="output"
								defaultValue={recipe?.output ?? ""}
								required
								maxLength={120}
								pattern=".*\S.*"
							/>
						</label>
						<label>
							Output quantity
							<input
								name="outputQuantity"
								type="number"
								min="1"
								max={Number.MAX_SAFE_INTEGER}
								step="1"
								defaultValue={recipe?.outputQuantity ?? 1}
								required
							/>
						</label>
					</div>
					<label>
						Notes
						<textarea
							name="notes"
							defaultValue={recipe?.notes ?? ""}
							rows={3}
						/>
					</label>
				</div>
				<footer className="dialog-footer">
					<button className="text-button" type="button" onClick={onClose}>
						Cancel
					</button>
					<button className="primary-button" type="submit">
						{recipe ? "Save changes" : "Create unknown recipe"}
					</button>
				</footer>
			</form>
		</Modal>
	);
}
