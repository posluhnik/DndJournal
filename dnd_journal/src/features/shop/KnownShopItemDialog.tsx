import { useState } from "react";
import type { FormEvent } from "react";
import type { JournalItem, ShopItem } from "../../types";
import { Modal } from "../../components/Modal";
import { BackpackItemPicker } from "../../components/BackpackItemPicker";
import { denominations } from "../wallet/currency";
import type { CoinCode } from "../wallet/currency";
import { resolveBackpackItem } from "../../lib/backpackLinks";
import { Icon } from "../../Icons";

export function KnownShopItemDialog({
	item,
	backpackItems,
	onSave,
	onClose,
}: {
	item?: ShopItem;
	backpackItems: readonly JournalItem[];
	onSave: (item: ShopItem) => void;
	onClose: () => void;
}) {
	const [sourceId, setSourceId] = useState(item?.sourceItemId ?? "");
	const [notes, setNotes] = useState(item?.notes ?? "");
	const [picking, setPicking] = useState(false);
	const [error, setError] = useState("");
	const source = backpackItems.find((entry) => entry.id === sourceId);

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!form.reportValidity()) return;
		try {
			const selected = resolveBackpackItem(sourceId, backpackItems);
			const data = new FormData(form);
			onSave({
				...item,
				id: item?.id ?? crypto.randomUUID(),
				name: selected.name,
				category: selected.category,
				unitWeight: selected.unitWeight,
				weightUnit: selected.weightUnit,
				quantity: Number(data.get("quantity")),
				price: Number(data.get("price")),
				currency: String(data.get("currency")) as CoinCode,
				notes,
				kind: "known",
				sourceItemId: selected.id,
			});
		} catch (failure) {
			setError(failure instanceof Error ? failure.message : String(failure));
		}
	}

	return (
		<Modal
			title={item ? "Edit known item" : "New known item"}
			onClose={onClose}
		>
			<form onSubmit={submit}>
				<div className="dialog-fields">
					<div className="known-item-field">
						<span>Item name</span>
						<button
							className="item-picker-field"
							type="button"
							onClick={() => setPicking(true)}
						>
							<Icon name="backpack" size={17} />
							<span>{source?.name ?? "Choose an item from your backpack"}</span>
							<Icon name="search" size={15} />
						</button>
					</div>
					<label>
						Category
						<input
							aria-label="Category"
							value={source?.category ?? ""}
							readOnly
						/>
					</label>
					<div className="form-columns">
						<label>
							Stock
							<input
								name="quantity"
								type="number"
								min="0"
								max={Number.MAX_SAFE_INTEGER}
								step="1"
								defaultValue={item?.quantity ?? 1}
								required
							/>
						</label>
						<label>
							Unit weight
							<input
								aria-label="Unit weight"
								value={source?.unitWeight ?? ""}
								readOnly
							/>
						</label>
						<label>
							Weight unit
							<input
								aria-label="Weight unit"
								value={source?.weightUnit ?? ""}
								readOnly
							/>
						</label>
					</div>
					<div className="form-columns two-columns">
						<label>
							Price per item
							<input
								name="price"
								type="number"
								min="0"
								max={Number.MAX_SAFE_INTEGER}
								step="1"
								defaultValue={item?.price ?? 0}
								required
							/>
						</label>
						<label>
							Currency
							<select name="currency" defaultValue={item?.currency ?? "GP"}>
								{denominations.map(({ code, label }) => (
									<option key={code} value={code}>
										{label} ({code})
									</option>
								))}
							</select>
						</label>
					</div>
					<label>
						Notes
						<textarea
							name="notes"
							value={notes}
							onChange={(event) => setNotes(event.currentTarget.value)}
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
						{item ? "Save changes" : "Create known item"}
					</button>
				</footer>
			</form>
			{picking && (
				<BackpackItemPicker
					mode="single"
					items={backpackItems}
					selectedId={sourceId}
					onConfirm={(id) => {
						const selected = resolveBackpackItem(id, backpackItems);
						setSourceId(id);
						setNotes(selected.notes);
						setPicking(false);
						setError("");
					}}
					onClose={() => setPicking(false)}
				/>
			)}
		</Modal>
	);
}
