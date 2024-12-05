import { Ingredient, IngredientMatch } from '../types';
import { ingredients } from '../data/ingredients';
import { normalizeIngredientName } from './normalizer';

export function matchIngredient(ingredientName: string): IngredientMatch {
  const normalized = normalizeIngredientName(ingredientName);
  
  const match = Object.entries(ingredients).find(([key]) => 
    normalized.includes(normalizeIngredientName(key))
  );

  if (match) {
    return {
      name: ingredientName,
      normalized,
      matched: true,
      details: match[1],
      categories: match[1].category
    };
  }

  return {
    name: ingredientName,
    normalized,
    matched: false
  };
}