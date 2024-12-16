import type { IngredientDatabase, Ingredient } from '../types';

interface IngredientMatch {
  ingredient: Ingredient;
  confidence: number;
}


/**
 * Calculate similarity score between 0 and 1
 */
function calculateSimilarity(searchTerm: string, target: string): number {
  const s1 = searchTerm.toLowerCase();
  const s2 = target.toLowerCase();

  // Exact match
  if (s1 === s2) return 1.0;

  // Check if target contains search term (lower confidence)
  if (s2.includes(s1)) {
    return 0.6; // Target contains search term
  }
  // Check if search term contains target (higher confidence)
  if (s1.includes(s2)) {
    return 0.8; // Search term contains target
  }

  // For multi-word strings, check if all words from one are in the other
  if (s1.includes(' ') || s2.includes(' ')) {
    const words1 = s1.split(/[\s-]+/);
    const words2 = s2.split(/[\s-]+/);

    // If target contains all search words (lower confidence)
    if (words1.every(word => s2.includes(word))) {
      return 0.6;
    }

    // If search contains all target words (higher confidence)
    if (words2.every(word => s1.includes(word))) {
      return 0.8;
    }
  }

  return 0; // No match
}

/**
 * Find an ingredient by name or synonym in the database
 * Returns both the ingredient and a confidence score
 * Confidence levels:
 * - 1.0: Exact match
 * - 0.8: High similarity match (search term found within ingredient)
 * - 0.6: Medium similarity match (ingredient found within search term)
 */
export function findIngredient(
  database: IngredientDatabase,
  searchTerm: string,
): IngredientMatch | undefined {
  const normalizedSearch = searchTerm.toLowerCase();

  // First try exact matches in main database
  for (const ingredient of Object.values(database.ingredients)) {
    if (ingredient.name.toLowerCase() === normalizedSearch) {
      return { ingredient, confidence: 1.0 };
    }
    if (ingredient.synonyms?.some(syn => syn.toLowerCase() === normalizedSearch)) {
      return { ingredient, confidence: 1.0 };
    }
  }


  // Finally try partial matches in main database
  let bestMatch: { ingredient: Ingredient; confidence: number } | undefined;

  for (const ingredient of Object.values(database.ingredients)) {
    let maxSimilarity = calculateSimilarity(ingredient.name, searchTerm);

    // Check synonyms for better matches
    if (ingredient.synonyms) {
      for (const syn of ingredient.synonyms) {
        const similarity = calculateSimilarity(syn, searchTerm);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
        }
      }
    }

    if (maxSimilarity > 0 && (!bestMatch || maxSimilarity > bestMatch.confidence)) {
      bestMatch = { ingredient, confidence: maxSimilarity };
    }
  }

  return bestMatch;
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
