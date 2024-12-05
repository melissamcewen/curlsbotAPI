import { IngredientMatch, IngredientAnalysisResult } from '../types';
import { parseIngredientList } from './parser';
import { matchIngredient } from './matcher';
import { ingredients } from '../data/ingredients';

export function analyzeIngredients(ingredientString: string): IngredientAnalysisResult {
  const ingredientList = parseIngredientList(ingredientString);
  const matches = ingredientList.map(ingredient => matchIngredient(ingredient));
  
  // Extract all unique categories from matched ingredients
  const categories = Array.from(new Set(
    matches
      .filter(match => match.matched && match.categories)
      .flatMap(match => match.categories!)
  )).sort();

  return {
    matches,
    categories
  };
}

export function findIngredientsByCategory(category: string): string[] {
  return Object.values(ingredients)
    .filter(ingredient => ingredient.category.includes(category))
    .map(ingredient => ingredient.name);
}