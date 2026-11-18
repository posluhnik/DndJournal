import { useState } from "react";
import type { JournalItem, Recipe } from "../../types";
import { Icon } from "../../Icons";
import { SearchBar } from "../../components/SearchBar";
import { RecipeDialog } from "./RecipeDialog";
import { KnownRecipeDialog } from "./KnownRecipeDialog";
import { recipeMaterials } from "../../lib/backpackLinks";
import type { useRecipes } from "./useRecipes";

export function RecipesPanel({
	collection,
	backpackItems,
}: {
	collection: ReturnType<typeof useRecipes>;
	backpackItems: readonly JournalItem[];
}) {
	const [search, setSearch] = useState("");
	const [editor, setEditor] = useState<{
		kind: "known" | "unknown";
		recipe?: Recipe;
	} | null>(null);
	const query = search.trim().toLocaleLowerCase();
	const recipes = collection.recipes.filter((recipe) =>
		`${recipe.name} ${recipeMaterials(recipe, backpackItems)} ${recipe.output}`
			.toLocaleLowerCase()
			.includes(query),
	);

	function edit(recipe: Recipe) {
		setEditor({ kind: recipe.kind === "known" ? "known" : "unknown", recipe });
	}

	function save(recipe: Recipe) {
		collection.saveRecipe(recipe);
		setSearch("");
		setEditor(null);
	}

	return (
		<>
			<div className="inventory-actions creation-toolbar">
				<SearchBar value={search} onChange={setSearch} label="Search recipes" />
				<div className="creation-actions">
					<button
						className="add-item-button"
						type="button"
						onClick={() => setEditor({ kind: "known" })}
					>
						<Icon name="plus" size={16} />
						New recipe
					</button>
					<button
						className="text-button unknown-create"
						type="button"
						onClick={() => setEditor({ kind: "unknown" })}
					>
						Create unknown recipe
					</button>
				</div>
			</div>
			<div className="table-scroll">
				<table className="inventory-table recipes-table">
					<caption className="sr-only">Recipes</caption>
					<thead>
						<tr>
							<th scope="col">Recipe</th>
							<th scope="col">Materials</th>
							<th scope="col">Output</th>
							<th scope="col">
								<span className="sr-only">Edit</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{recipes.map((recipe) => (
							<tr key={recipe.id}>
								<th scope="row">
									<button
										className="item-link"
										type="button"
										onClick={() => edit(recipe)}
									>
										<span className="item-name">{recipe.name}</span>
									</button>
								</th>
								<td className="recipe-text">
									{recipeMaterials(recipe, backpackItems)}
								</td>
								<td className="recipe-text">
									{recipe.outputQuantity} × {recipe.output}
								</td>
								<td className="row-action">
									<button
										className="icon-button"
										type="button"
										aria-label={`Edit recipe ${recipe.name}`}
										title="Edit recipe"
										onClick={() => edit(recipe)}
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
				<KnownRecipeDialog
					recipe={editor.recipe}
					backpackItems={backpackItems}
					onSave={save}
					onClose={() => setEditor(null)}
				/>
			)}
			{editor?.kind === "unknown" && (
				<RecipeDialog
					recipe={editor.recipe}
					backpackItems={backpackItems}
					onSave={save}
					onClose={() => setEditor(null)}
				/>
			)}
		</>
	);
}
