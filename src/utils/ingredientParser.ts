import { ingredients } from '../data/ingredients';
import { IngredientMatch } from '../types';

export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');
}

export function parseIngredientList(ingredientString: string): string[] {
  return ingredientString
    .split(',')
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0);
}

export function matchIngredient(ingredientName: string): IngredientMatch {
  const normalized = normalizeIngredientName(ingredientName);
  
  const match = Object.entries(ingredients).find(([key]) => 
    normalized.includes(normalizeIngredientName(key))
  );

  if (match) {
    return {
      matched: true,
      name: match[1].name,
      details: match[1]
    };
  }

  return {
    matched: false,
    name: ingredientName
  };
}