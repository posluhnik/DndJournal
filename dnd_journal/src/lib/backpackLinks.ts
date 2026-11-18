import type {
	JournalItem,
	MaterialSelection,
	Recipe,
	RecipeIngredient,
} from "../types";

export function resolveBackpackItem(
	id: string,
	items: readonly JournalItem[],
): JournalItem {
	const item = items.find((entry) => entry.id === id);
	if (!item) throw new Error("Choose an item that is in your backpack.");
	return item;
}

export function snapshotMaterials(
	selection: readonly MaterialSelection[],
	items: readonly JournalItem[],
): RecipeIngredient[] {
	if (!selection.length)
		throw new Error("Choose at least one material from your backpack.");
	const seen = new Set<string>();
	return selection.map(({ itemId, quantity }) => {
		if (seen.has(itemId))
			throw new Error("Each material can only be selected once.");
		if (!Number.isSafeInteger(quantity) || quantity < 1)
			throw new Error("Material quantities must be positive whole numbers.");
		seen.add(itemId);
		const source = resolveBackpackItem(itemId, items);
		return { itemId, quantity, name: source.name, category: source.category };
	});
}

export function materialSummary(
	ingredients: readonly RecipeIngredient[],
	items: readonly JournalItem[] = [],
): string {
	const sources = new Map(items.map((item) => [item.id, item]));
	return ingredients
		.map(
			(ingredient) =>
				`${ingredient.quantity} × ${sources.get(ingredient.itemId)?.name ?? ingredient.name}`,
		)
		.join("\n");
}

export function recipeMaterials(
	recipe: Recipe,
	items: readonly JournalItem[],
): string {
	return recipe.kind === "known" && recipe.ingredients
		? materialSummary(recipe.ingredients, items)
		: recipe.materials;
}
