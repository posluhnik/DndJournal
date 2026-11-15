import { useState } from "react";
import type { Recipe } from "../../types";
import { Icon } from "../../Icons";
import { SearchBar } from "../../components/SearchBar";
import { RecipeDialog } from "./RecipeDialog";
import type { useRecipes } from "./useRecipes";

export function RecipesPanel({ collection }: { collection: ReturnType<typeof useRecipes> }) {
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<{ recipe?: Recipe } | null>(null);
  const query = search.trim().toLocaleLowerCase();
  const recipes = collection.recipes.filter((recipe) => `${recipe.name} ${recipe.materials} ${recipe.output}`.toLocaleLowerCase().includes(query));

  function save(recipe: Recipe) {
    collection.saveRecipe(recipe);
    setSearch("");
    setEditor(null);
  }

  return <>
    <div className="inventory-actions"><SearchBar value={search} onChange={setSearch} label="Search recipes" /><button className="add-item-button" type="button" onClick={() => setEditor({})}><Icon name="plus" size={16} />New recipe</button></div>
    <div className="table-scroll"><table className="inventory-table recipes-table">
      <caption className="sr-only">Recipes</caption>
      <thead><tr><th scope="col">Recipe</th><th scope="col">Materials</th><th scope="col">Output</th><th scope="col"><span className="sr-only">Edit</span></th></tr></thead>
      <tbody>{recipes.map((recipe) => <tr key={recipe.id}>
        <th scope="row"><button className="item-link" type="button" onClick={() => setEditor({ recipe })}><span className="item-name">{recipe.name}</span></button></th>
        <td className="recipe-text">{recipe.materials}</td>
        <td className="recipe-text">{recipe.outputQuantity} × {recipe.output}</td>
        <td className="row-action"><button className="icon-button" type="button" aria-label={`Edit recipe ${recipe.name}`} title="Edit recipe" onClick={() => setEditor({ recipe })}><Icon name="pen" size={16} /></button></td>
      </tr>)}</tbody>
    </table></div>
    {editor && <RecipeDialog recipe={editor.recipe} onSave={save} onClose={() => setEditor(null)} />}
  </>;
}
