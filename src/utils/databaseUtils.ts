import type { IngredientDatabase, Ingredient } from '../types';

interface IngredientMatch {
  ingredient: Ingredient;
  confidence: number;
}

/**
 * Find an ingredient by name or synonym in the database
 * Returns both the ingredient and a confidence score
 * Confidence levels:
 * - 1.0: Exact match on name or synonym
 * - 0.8: Substring match (search term found within ingredient/synonym)
 * - 0.6: Superstring match (ingredient/synonym found within search term)
 */
export function findIngredient(
  database: IngredientDatabase,
  searchTerm: string,
  fallbackDatabase?: IngredientDatabase
): IngredientMatch | undefined {
  const normalizedSearch = searchTerm.toLowerCase();

  // Helper functions for different types of matches
  const isSubstringMatch = (term: string, search: string) => {
    const normalizedTerm = term.toLowerCase();
    return normalizedTerm.includes(search);
  };

  const isSuperstringMatch = (term: string, search: string) => {
    const normalizedTerm = term.toLowerCase();
    return search.includes(normalizedTerm);
  };

  // Search in main database
  for (const ingredient of Object.values(database.ingredients)) {
    // Exact name or synonym match
    if (ingredient.name.toLowerCase() === normalizedSearch) {
      return { ingredient, confidence: 1.0 };
    }
    if (ingredient.synonyms?.some(syn => syn.toLowerCase() === normalizedSearch)) {
      return { ingredient, confidence: 1.0 };
    }

    // Substring match (search term found within ingredient/synonym)
    if (isSubstringMatch(ingredient.name, normalizedSearch)) {
      return { ingredient, confidence: 0.8 };
    }
    if (ingredient.synonyms?.some(syn => isSubstringMatch(syn, normalizedSearch))) {
      return { ingredient, confidence: 0.8 };
    }

    // Superstring match (ingredient/synonym found within search term)
    if (isSuperstringMatch(ingredient.name, normalizedSearch)) {
      return { ingredient, confidence: 0.6 };
    }
    if (ingredient.synonyms?.some(syn => isSuperstringMatch(syn, normalizedSearch))) {
      return { ingredient, confidence: 0.6 };
    }
  }

  // If not found and fallback database provided, search there
  if (fallbackDatabase) {
    for (const ingredient of Object.values(fallbackDatabase.ingredients)) {
      // Exact name or synonym match
      if (ingredient.name.toLowerCase() === normalizedSearch) {
        return { ingredient, confidence: 1.0 };
      }
      if (ingredient.synonyms?.some(syn => syn.toLowerCase() === normalizedSearch)) {
        return { ingredient, confidence: 1.0 };
      }

      // Substring match (search term found within ingredient/synonym)
      if (isSubstringMatch(ingredient.name, normalizedSearch)) {
        return { ingredient, confidence: 0.8 };
      }
      if (ingredient.synonyms?.some(syn => isSubstringMatch(syn, normalizedSearch))) {
        return { ingredient, confidence: 0.8 };
      }

      // Superstring match (ingredient/synonym found within search term)
      if (isSuperstringMatch(ingredient.name, normalizedSearch)) {
        return { ingredient, confidence: 0.6 };
      }
      if (ingredient.synonyms?.some(syn => isSuperstringMatch(syn, normalizedSearch))) {
        return { ingredient, confidence: 0.6 };
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
