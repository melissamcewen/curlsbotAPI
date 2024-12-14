import type { IngredientDatabase, Ingredient } from '../types';

/**
 * Finds an ingredient in the database by name or synonym
 * If not found in the main database and a fallback database is provided, searches there
 */
export function findIngredient(
  database: IngredientDatabase,
  normalizedName: string,
  fallbackDatabase?: IngredientDatabase
): Ingredient | undefined {
  const searchName = normalizedName.toLowerCase();

  // First try the main database
  const mainResult = Object.values(database.ingredients).find(ingredient => {
    if (ingredient.name.toLowerCase() === searchName) {
      return true;
    }
    if (ingredient.synonyms) {
      return ingredient.synonyms.some(s => s.toLowerCase() === searchName);
    }
    return false;
  });

  if (mainResult) {
    return mainResult;
  }

  // If not found and fallback database exists, try there
  if (fallbackDatabase) {
    return Object.values(fallbackDatabase.ingredients).find(ingredient => {
      if (ingredient.name.toLowerCase() === searchName) {
        return true;
      }
      if (ingredient.synonyms) {
        return ingredient.synonyms.some(s => s.toLowerCase() === searchName);
      }
      return false;
    });
  }

  return undefined;
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
  const groups = categories.flatMap(catId => {
    const category = database.categories[catId];
    return category?.group ? [category.group] : [];
  });
  // Return unique groups
  return [...new Set(groups)];
}
