import type { IngredientDatabase, Ingredient } from '../types';

/**
 * Find an ingredient by name or synonym in the database
 */
export function findIngredient(
  database: IngredientDatabase,
  searchTerm: string,
  fallbackDatabase?: IngredientDatabase
): Ingredient | undefined {
  const normalizedSearch = searchTerm.toLowerCase();

  // Search in main database
  for (const ingredient of Object.values(database.ingredients)) {
    if (ingredient.name.toLowerCase() === normalizedSearch) {
      return ingredient;
    }
    if (ingredient.synonyms?.some(syn => syn.toLowerCase() === normalizedSearch)) {
      return ingredient;
    }
  }

  // If not found and fallback database provided, search there
  if (fallbackDatabase) {
    for (const ingredient of Object.values(fallbackDatabase.ingredients)) {
      if (ingredient.name.toLowerCase() === normalizedSearch) {
        return ingredient;
      }
      if (ingredient.synonyms?.some(syn => syn.toLowerCase() === normalizedSearch)) {
        return ingredient;
      }
    }
  }

  return undefined;
}

/**
 * Get category objects for a list of category IDs
 */
export function getIngredientCategories(
  database: IngredientDatabase,
  categoryIds: string | string[]
): string[] {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  return ids.filter(id => database.categories[id] !== undefined);
}

/**
 * Get unique group IDs for a list of category IDs
 */
export function getCategoryGroups(
  database: IngredientDatabase,
  categoryIds: string[]
): string[] {
  const groups = new Set<string>();

  categoryIds.forEach(categoryId => {
    const category = database.categories[categoryId];
    if (category) {
      groups.add(category.group);
    }
  });

  return Array.from(groups);
}
