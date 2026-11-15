import { useCallback, useState } from "react";
import type { Recipe } from "../../types";
import { saveRecord } from "../../lib/records";

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const saveRecipe = useCallback((recipe: Recipe) => {
    setRecipes((current) => saveRecord(current, recipe));
  }, []);
  return { recipes, saveRecipe };
}
