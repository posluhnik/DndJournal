import { useState } from "react";
import type { JournalItem, MaterialSelection } from "../types";
import { Modal } from "./Modal";
import { SearchBar } from "./SearchBar";

type Props = {
	items: readonly JournalItem[];
	onClose: () => void;
} & (
	| { mode: "single"; selectedId?: string; onConfirm: (id: string) => void }
	| {
			mode: "materials";
			selected: readonly MaterialSelection[];
			onConfirm: (materials: MaterialSelection[]) => void;
	  }
);

export function BackpackItemPicker(props: Props) {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");
	const [selected, setSelected] = useState<string[]>(() =>
		props.mode === "single"
			? props.selectedId
				? [props.selectedId]
				: []
			: props.selected.map((entry) => entry.itemId),
	);
	const [amounts, setAmounts] = useState<Record<string, string>>(() =>
		props.mode === "materials"
			? Object.fromEntries(
					props.selected.map((entry) => [entry.itemId, String(entry.quantity)]),
				)
			: {},
	);
	const [error, setError] = useState("");
	const categories = [
		...new Set(props.items.map((item) => item.category).filter(Boolean)),
	].sort();
	const query = search.trim().toLocaleLowerCase();
	const visible = props.items.filter(
		(item) =>
			(!category || item.category === category) &&
			`${item.name} ${item.category}`.toLocaleLowerCase().includes(query),
	);

	function toggle(id: string) {
		setError("");
		if (props.mode === "single") setSelected([id]);
		else
			setSelected((current) =>
				current.includes(id)
					? current.filter((entry) => entry !== id)
					: [...current, id],
			);
	}

	function confirm() {
		if (!selected.length) return;
		if (selected.some((id) => !props.items.some((item) => item.id === id))) {
			setError("An item is no longer in your backpack. Update the selection.");
			return;
		}
		if (props.mode === "single") props.onConfirm(selected[0]);
		else {
			const materials = selected.map((itemId) => ({
				itemId,
				quantity: Number(amounts[itemId] ?? "1"),
			}));
			if (
				materials.some(
					(entry) =>
						!Number.isSafeInteger(entry.quantity) || entry.quantity < 1,
				)
			) {
				setError(
					"Enter a positive whole quantity for every selected material.",
				);
				return;
			}
			props.onConfirm(materials);
		}
	}

	return (
		<Modal
			title={
				props.mode === "materials"
					? "Choose backpack materials"
					: "Choose backpack item"
			}
			onClose={props.onClose}
			className="backpack-picker"
		>
			<div className="picker-filters">
				<SearchBar
					value={search}
					onChange={setSearch}
					label="Search backpack"
				/>
				<label className="sr-only" htmlFor="picker-category">
					Category filter
				</label>
				<select
					id="picker-category"
					aria-label="Category filter"
					value={category}
					onChange={(event) => setCategory(event.currentTarget.value)}
				>
					<option value="">All categories</option>
					{categories.map((name) => (
						<option key={name} value={name}>
							{name}
						</option>
					))}
				</select>
			</div>
			<div className="picker-list">
				{visible.length ? (
					<table className="inventory-table picker-table">
						<caption className="sr-only">Items in your backpack</caption>
						<thead>
							<tr>
								<th scope="col">
									<span className="sr-only">Select</span>
								</th>
								<th scope="col">Item</th>
								<th scope="col">Category</th>
								<th scope="col" className="picker-number">
									Have
								</th>
								{props.mode === "materials" && (
									<th scope="col" className="picker-number">
										Required
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{visible.map((item) => (
								<tr
									key={item.id}
									className={
										selected.includes(item.id) ? "picker-selected" : undefined
									}
								>
									<td>
										<input
											type={props.mode === "single" ? "radio" : "checkbox"}
											name="backpack-selection"
											checked={selected.includes(item.id)}
											onChange={() => toggle(item.id)}
											aria-label={`Select ${item.name}`}
										/>
									</td>
									<th scope="row">
										<button
											className="item-link"
											type="button"
											onClick={() => toggle(item.id)}
										>
											{item.name}
										</button>
									</th>
									<td className="picker-category">{item.category}</td>
									<td className="picker-number">{item.quantity}</td>
									{props.mode === "materials" && (
										<td className="picker-number">
											<input
												type="number"
												min="1"
												max={Number.MAX_SAFE_INTEGER}
												step="1"
												aria-label={`Required ${item.name} quantity`}
												disabled={!selected.includes(item.id)}
												value={amounts[item.id] ?? "1"}
												onChange={(event) => {
													const value = event.currentTarget.value;
													setAmounts((current) => ({
														...current,
														[item.id]: value,
													}));
													setError("");
												}}
											/>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<p className="picker-empty">
						{props.items.length
							? "No backpack items match your search."
							: "Your backpack is empty. Add an item to the backpack, or use the unknown creation option."}
					</p>
				)}
			</div>
			{error && (
				<p className="form-error picker-error" role="alert">
					{error}
				</p>
			)}
			<footer className="dialog-footer">
				<span className="picker-selection-count">
					{selected.length} selected
				</span>
				<button className="text-button" type="button" onClick={props.onClose}>
					Cancel
				</button>
				<button
					className="primary-button"
					type="button"
					disabled={!selected.length}
					onClick={confirm}
				>
					{props.mode === "single" ? "Use item" : "Use materials"}
				</button>
			</footer>
		</Modal>
	);
}
