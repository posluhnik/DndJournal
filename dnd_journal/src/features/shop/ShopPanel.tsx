import { useState } from "react";
import type { JournalItem, ShopItem } from "../../types";
import { Icon } from "../../Icons";
import { ItemDialog } from "../../components/ItemDialog";
import { KnownShopItemDialog } from "./KnownShopItemDialog";
import { SearchBar } from "../../components/SearchBar";
import type { useShop } from "./useShop";

export function ShopPanel({
	shop,
	selectedId,
	onSelect,
	backpackItems,
}: {
	shop: ReturnType<typeof useShop>;
	selectedId: string | null;
	onSelect: (id: string) => void;
	backpackItems: readonly JournalItem[];
}) {
	const [search, setSearch] = useState("");
	const [editor, setEditor] = useState<{
		kind: "known" | "unknown";
		item?: ShopItem;
	} | null>(null);
	const query = search.trim().toLocaleLowerCase();
	const visibleItems = shop.items.filter((item) =>
		`${item.name} ${item.category}`.toLocaleLowerCase().includes(query),
	);

	function save(item: ShopItem) {
		shop.saveItem(item);
		onSelect(item.id);
		setSearch("");
		setEditor(null);
	}

	return (
		<>
			<div className="inventory-actions creation-toolbar">
				<SearchBar value={search} onChange={setSearch} label="Search shop" />
				<div className="creation-actions">
					<button
						className="add-item-button"
						type="button"
						onClick={() => setEditor({ kind: "known" })}
					>
						<Icon name="plus" size={16} />
						New known item
					</button>
					<button
						className="text-button unknown-create"
						type="button"
						onClick={() => setEditor({ kind: "unknown" })}
					>
						Create unknown item
					</button>
				</div>
			</div>
			<div className="table-scroll">
				<table className="inventory-table shop-table">
					<caption className="sr-only">Shop catalog</caption>
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
								Stock
							</th>
							<th scope="col" className="weight-heading">
								Price
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
								<td className="stock-cell">{item.quantity}</td>
								<td className="weight-cell">
									{item.price}
									<span> {item.currency}</span>
								</td>
								<td className="row-action">
									<button
										className="icon-button"
										type="button"
										aria-label={`Edit shop item ${item.name}`}
										title="Edit shop item"
										onClick={() =>
											setEditor({
												kind: item.kind === "known" ? "known" : "unknown",
												item,
											})
										}
									>
										<Icon name="pen" size={16} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{editor?.kind === "known" && (
				<KnownShopItemDialog
					item={editor.item}
					backpackItems={backpackItems}
					onSave={save}
					onClose={() => setEditor(null)}
				/>
			)}
			{editor?.kind === "unknown" && (
				<ItemDialog
					mode="shop"
					item={editor.item}
					onSave={save}
					onClose={() => setEditor(null)}
				/>
			)}
		</>
	);
}
