import { useState } from "react";
import { CollectionTabs } from "./components/CollectionTabs";
import { BackpackPanel } from "./features/backpack/BackpackPanel";
import { useBackpack } from "./features/backpack/useBackpack";
import { DrawingWorkspace } from "./features/drawing/DrawingWorkspace";
import { useDrawingHistory } from "./features/drawing/useDrawingHistory";
import { RecipesPanel } from "./features/recipes/RecipesPanel";
import { useRecipes } from "./features/recipes/useRecipes";
import { ShopPanel } from "./features/shop/ShopPanel";
import { useShop } from "./features/shop/useShop";
import { WalletPanel } from "./features/wallet/WalletPanel";
import { useWallet } from "./features/wallet/useWallet";
import { useJournalStatus } from "./lib/journalStore";

import "./App.css";
import "./components/selection.css";
import "./JournalStatusBar.css";

export default function App() {
	const backpack = useBackpack();
	const shop = useShop();
	const recipes = useRecipes();
	const wallet = useWallet();

	const persistence = useJournalStatus();

	const [selectedPage, setSelectedPage] = useState("workspace");

	const drawing = useDrawingHistory(selectedPage);

	const statusText = persistence.saveError
		? "Save failed"
		: persistence.saving
			? "Saving..."
			: persistence.dirty
				? "Changes pending..."
				: "All changes saved";

	const statusKind = persistence.saveError
		? "error"
		: persistence.saving || persistence.dirty
			? "pending"
			: "saved";

	return (
		<main className="app-shell" aria-label="D&D Journal">
			<header className="journal-statusbar">
				<div className="journal-statusbar__brand">D&D Journal</div>

				<div className="journal-statusbar__right">
					<div
						className={`journal-statusbar__status is-${statusKind}`}
						role="status"
						aria-live="polite"
					>
						<span className="journal-statusbar__indicator" aria-hidden="true" />

						<span>{statusText}</span>
					</div>

					{persistence.saveError && (
						<>
							<span
								className="journal-statusbar__error"
								role="alert"
								title={persistence.saveError}
							>
								{persistence.saveError}
							</span>

							<button
								className="journal-statusbar__retry"
								type="button"
								onClick={persistence.retrySave}
							>
								Retry
							</button>
						</>
					)}

					<details className="journal-statusbar__database">
						<summary>Database</summary>
						<code>{persistence.path}</code>
					</details>
				</div>
			</header>

			<div className="workspace">
				<DrawingWorkspace key={selectedPage} {...drawing} />

				<aside className="inventory-column" aria-label="Inventory and currency">
					<WalletPanel wallet={wallet} />

					<CollectionTabs
						counts={{
							backpack: backpack.items.length,
							recipes: recipes.recipes.length,
							shop: shop.items.length,
						}}
						panels={{
							backpack: (
								<BackpackPanel
									backpack={backpack}
									selectedId={
										selectedPage.startsWith("backpack:")
											? selectedPage.slice(9)
											: null
									}
									onSelect={(id) => setSelectedPage(`backpack:${id}`)}
								/>
							),

							recipes: (
								<RecipesPanel
									collection={recipes}
									backpackItems={backpack.items}
								/>
							),

							shop: (
								<ShopPanel
									shop={shop}
									backpackItems={backpack.items}
									selectedId={
										selectedPage.startsWith("shop:")
											? selectedPage.slice(5)
											: null
									}
									onSelect={(id) => setSelectedPage(`shop:${id}`)}
								/>
							),
						}}
					/>
				</aside>
			</div>
		</main>
	);
}
