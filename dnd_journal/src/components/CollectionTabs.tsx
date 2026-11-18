import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { InventoryTab } from "../types";
import { Icon } from "../Icons";

const tabs = [
	{ id: "backpack", label: "Backpack", icon: "backpack" },
	{ id: "recipes", label: "Recipes", icon: "recipe" },
	{ id: "shop", label: "Shop", icon: "shop" },
] as const;

export function CollectionTabs({
	panels,
	counts,
}: {
	panels: Record<InventoryTab, ReactNode>;
	counts: Record<InventoryTab, number>;
}) {
	const [activeTab, setActiveTab] = useState<InventoryTab>("backpack");

	function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
		let next: number;
		if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
		else if (event.key === "ArrowLeft")
			next = (index + tabs.length - 1) % tabs.length;
		else if (event.key === "Home") next = 0;
		else if (event.key === "End") next = tabs.length - 1;
		else return;
		event.preventDefault();
		setActiveTab(tabs[next].id);
		event.currentTarget.parentElement
			?.querySelector<HTMLButtonElement>(`#${tabs[next].id}-tab`)
			?.focus();
	}

	return (
		<section className="backpack-panel panel" aria-label="Inventory">
			<div
				className="inventory-tabs"
				role="tablist"
				aria-label="Inventory sections"
			>
				{tabs.map(({ id, label, icon }, index) => (
					<button
						key={id}
						id={`${id}-tab`}
						type="button"
						role="tab"
						className={`tab${activeTab === id ? " is-selected" : ""}`}
						aria-selected={activeTab === id}
						aria-controls={`${id}-content`}
						tabIndex={activeTab === id ? 0 : -1}
						onClick={() => setActiveTab(id)}
						onKeyDown={(event) => navigate(event, index)}
					>
						<Icon name={icon} size={17} />
						{label}
						{counts[id] > 0 && <span className="item-count">{counts[id]}</span>}
					</button>
				))}
			</div>
			<div
				id={`${activeTab}-content`}
				className="inventory-content"
				role="tabpanel"
				aria-labelledby={`${activeTab}-tab`}
			>
				{panels[activeTab]}
			</div>
		</section>
	);
}
