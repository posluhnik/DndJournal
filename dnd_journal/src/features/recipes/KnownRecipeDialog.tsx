import { useState } from "react";
import type { FormEvent } from "react";
import type { JournalItem, MaterialSelection, Recipe } from "../../types";
import { Modal } from "../../components/Modal";
import { BackpackItemPicker } from "../../components/BackpackItemPicker";
import { Icon } from "../../Icons";
import { readName } from "../../lib/forms";
import { materialSummary, snapshotMaterials } from "../../lib/backpackLinks";

export function KnownRecipeDialog({
	recipe,
	backpackItems,
	onSave,
	onClose,
}: {
	recipe?: Recipe;
	backpackItems: readonly JournalItem[];
	onSave: (recipe: Recipe) => void;
	onClose: () => void;
}) {
	const [selection, setSelection] = useState<MaterialSelection[]>(() =>
		(recipe?.ingredients ?? []).map(({ itemId, quantity }) => ({
			itemId,
			quantity,
		})),
	);
	const [picking, setPicking] = useState(false);
	const [error, setError] = useState("");

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const name = readName(form, data);
		if (!name) return;
		try {
			const ingredients = snapshotMaterials(selection, backpackItems);
			onSave({
				...recipe,
				id: recipe?.id ?? crypto.randomUUID(),
				name,
				materials: materialSummary(ingredients),
				output: String(data.get("output") ?? "").trim(),
				outputQuantity: Number(data.get("outputQuantity")),
				notes: String(data.get("notes") ?? ""),
				kind: "known",
				ingredients,
			});
		} catch (failure) {
			setError(failure instanceof Error ? failure.message : String(failure));
		}
	}

	return (
		<Modal title={recipe ? "Edit recipe" : "New recipe"} onClose={onClose}>
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
					<div className="material-field">
						<div className="material-field-heading">
							<span>Materials</span>
							<button
								className="text-button"
								type="button"
								onClick={() => setPicking(true)}
							>
								<Icon name="backpack" size={15} />
								Choose materials
							</button>
						</div>
						{selection.length ? (
							<ul className="selected-materials">
								{selection.map((entry) => {
									const source = backpackItems.find(
										(item) => item.id === entry.itemId,
									);
									const saved = recipe?.ingredients?.find(
										(item) => item.itemId === entry.itemId,
									);
									const name =
										source?.name ?? saved?.name ?? "Unavailable item";
									return (
										<li key={entry.itemId}>
											<div>
												<strong>
													{entry.quantity} × {name}
												</strong>
												<span>
													{source?.category ?? saved?.category}
													{!source && " · No longer in backpack"}
												</span>
											</div>
											<button
												className="close-button"
												type="button"
												aria-label={`Remove ${name} material`}
												onClick={() => {
													setSelection((current) =>
														current.filter(
															(item) => item.itemId !== entry.itemId,
														),
													);
													setError("");
												}}
											>
												×
											</button>
										</li>
									);
								})}
							</ul>
						) : (
							<p className="selection-hint">
								Choose ingredient items and required quantities from your
								backpack.
							</p>
						)}
					</div>
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
					{error && (
						<p className="form-error" role="alert">
							{error}
						</p>
					)}
				</div>
				<footer className="dialog-footer">
					<button className="text-button" type="button" onClick={onClose}>
						Cancel
					</button>
					<button className="primary-button" type="submit">
						{recipe ? "Save changes" : "Create recipe"}
					</button>
				</footer>
			</form>
			{picking && (
				<BackpackItemPicker
					mode="materials"
					items={backpackItems}
					selected={selection}
					onConfirm={(materials) => {
						setSelection(materials);
						setPicking(false);
						setError("");
					}}
					onClose={() => setPicking(false)}
				/>
			)}
		</Modal>
	);
}
