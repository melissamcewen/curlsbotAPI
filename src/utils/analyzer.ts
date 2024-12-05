import { IngredientMatch, IngredientAnalysisResult } from '../types';
import { parseIngredientList } from './parser';
import { matchIngredient } from './matcher';
import { ingredients } from '../data/ingredients';

export function analyzeIngredients(ingredientString: string): IngredientAnalysisResult {
  const ingredientList = parseIngredientList(ingredientString);
  return ingredientList.map(ingredient => matchIngredient(ingredient));
}

export function findIngredientsByCategory(category: string): string[] {
  return Object.values(ingredients)
    .filter(ingredient => ingredient.category.includes(category))
    .map(ingredient => ingredient.name);
}