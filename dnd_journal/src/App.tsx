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
import "./App.css";

export default function App() {
	const backpack = useBackpack();
	const shop = useShop();
	const recipes = useRecipes();
	const wallet = useWallet();
	const [selectedPage, setSelectedPage] = useState("workspace");
	const drawing = useDrawingHistory(selectedPage);

	return (
		<main className="app-shell" aria-label="Journal">
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
							recipes: <RecipesPanel collection={recipes} />,
							shop: (
								<ShopPanel
									shop={shop}
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
