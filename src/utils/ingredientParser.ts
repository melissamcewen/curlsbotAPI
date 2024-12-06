import { IngredientMatch } from '../types';

// In-memory store for ingredients
let ingredients: Record<string, { name: string; [key: string]: any }> = {};

// Function to add or update an ingredient
export function addIngredient(name: string, details: { [key: string]: any }): void {
  ingredients[normalizeIngredientName(name)] = { name, ...details };
}

// Function to remove an ingredient
export function removeIngredient(name: string): boolean {
  const normalizedName = normalizeIngredientName(name);
  if (ingredients[normalizedName]) {
    delete ingredients[normalizedName];
    return true;
  }
  return false;
}

// Function to normalize ingredient names
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');
}

// Function to parse an ingredient list
export function parseIngredientList(ingredientString: string): string[] {
  return ingredientString
    .split(',')
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0);
}

// Function to match an ingredient
export function matchIngredient(ingredientName: string): IngredientMatch {
  const normalized = normalizeIngredientName(ingredientName);

  const match = Object.entries(ingredients).find(([key]) =>
    normalized.includes(key)
  );

  if (match) {
    return {
      matched: true,
      name: match[1].name,
      normalized: normalizeIngredientName(ingredientName),
      details: {
        name: match[1].name,
        description: match[1].description,
        category: match[1].category,
        notes: match[1].notes,
        source: match[1].source,
        synonyms: match[1].synonyms
      }
    };
  }

  return {
    matched: false,
    name: ingredientName,
    normalized: normalizeIngredientName(ingredientName)
  };
}

// Optional: Reset ingredients (useful for tests or resets)
export function resetIngredients(): void {
  ingredients = {};
}
