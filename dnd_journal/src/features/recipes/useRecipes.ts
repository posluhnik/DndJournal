import { useCallback } from "react";
import { useJournalState } from "../../lib/journalStore";
import type { Recipe } from "../../types";
import { saveRecord } from "../../lib/records";

export function useRecipes() {
	const [recipes, setRecipes] = useJournalState<Recipe[]>("recipes", []);
	const saveRecipe = useCallback((recipe: Recipe) => {
		setRecipes((current) => saveRecord(current, recipe));
	}, []);
	return { recipes, saveRecipe };
}
