import { useState } from "react";
import type { JournalItem } from "../../types";
import { Icon } from "../../Icons";
import { ItemDialog } from "../../components/ItemDialog";
import { SearchBar } from "../../components/SearchBar";
import type { useBackpack } from "./useBackpack";

export function BackpackPanel({
	backpack,
	selectedId,
	onSelect,
}: {
	backpack: ReturnType<typeof useBackpack>;
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	const [search, setSearch] = useState("");
	const [editor, setEditor] = useState<{ item?: JournalItem } | null>(null);
	const query = search.trim().toLocaleLowerCase();
	const visibleItems = backpack.items.filter((item) =>
		`${item.name} ${item.category}`.toLocaleLowerCase().includes(query),
	);

	function save(item: JournalItem) {
		backpack.saveItem(item);
		onSelect(item.id);
		setSearch("");
		setEditor(null);
	}

	return (
		<>
			<div className="inventory-actions">
				<SearchBar value={search} onChange={setSearch} label="Search items" />
				<button
					className="add-item-button"
					type="button"
					onClick={() => setEditor({})}
				>
					<Icon name="plus" size={16} />
					Add item
				</button>
			</div>
			<div className="table-scroll">
				<table className="inventory-table">
					<caption className="sr-only">Backpack inventory</caption>
					<colgroup>
						<col className="item-column" />
						<col className="quantity-column" />
						<col className="weight-column" />
						<col className="actions-column" />
					</colgroup>
					<thead>
						<tr>
							<th scope="col">Item</th>
							<th scope="col" className="quantity-heading">
								Quantity
							</th>
							<th scope="col" className="weight-heading">
								Unit weight
							</th>
							<th scope="col">
								<span className="sr-only">Edit</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{visibleItems.map((item) => (
							<tr
								className={item.id === selectedId ? "selected-row" : undefined}
								key={item.id}
							>
								<th scope="row">
									<button
										className="item-link"
										type="button"
										aria-pressed={item.id === selectedId}
										onClick={() => onSelect(item.id)}
									>
										<span className="item-name">{item.name}</span>
										{item.category && (
											<span className="item-category">{item.category}</span>
										)}
									</button>
								</th>
								<td>
									<div className="quantity-control">
										<button
											type="button"
											aria-label={`Decrease ${item.name} quantity`}
											disabled={item.quantity === 0}
											onClick={() => backpack.changeQuantity(item.id, -1)}
										>
											<Icon name="minus" size={13} />
										</button>
										<span>{item.quantity}</span>
										<button
											type="button"
											aria-label={`Increase ${item.name} quantity`}
											onClick={() => backpack.changeQuantity(item.id, 1)}
										>
											<Icon name="plus" size={13} />
										</button>
									</div>
								</td>
								<td className="weight-cell">
									{item.unitWeight}
									{item.weightUnit && <span> {item.weightUnit}</span>}
								</td>
								<td className="row-action">
									<button
										className="icon-button"
										type="button"
										aria-label={`Edit ${item.name}`}
										title="Edit item"
										onClick={() => setEditor({ item })}
									>
										<Icon name="pen" size={16} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{editor && (
				<ItemDialog
					mode="backpack"
					item={editor.item}
					onSave={save}
					onClose={() => setEditor(null)}
				/>
			)}
		</>
	);
}
