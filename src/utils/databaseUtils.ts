import type { IngredientDatabase, Ingredient } from '../types';

/**
 * Finds an ingredient in the database by name or synonym
 */
export function findIngredient(database: IngredientDatabase, normalizedName: string): Ingredient | undefined {
  const searchName = normalizedName.toLowerCase();
  return Object.values(database.ingredients).find(ingredient => {
    if (ingredient.name.toLowerCase() === searchName) {
      return true;
    }
    if (ingredient.synonyms) {
      return ingredient.synonyms.some(s => s.toLowerCase() === searchName);
    }
    return false;
  });
}

/**
 * Gets categories for an ingredient
 */
export function getIngredientCategories(database: IngredientDatabase, ingredient: string | string[]): string[] {
  const categories = Array.isArray(ingredient) ? ingredient : [ingredient];
  return categories.flatMap(catId => {
    const category = database.categories[catId];
    return category ? [category.id] : [];
  });
}

/**
 * Gets groups for categories
 */
export function getCategoryGroups(database: IngredientDatabase, categories: string[]): string[] {
  return categories.flatMap(catId => {
    const category = database.categories[catId];
    return category?.group ? [category.group] : [];
  });
}
