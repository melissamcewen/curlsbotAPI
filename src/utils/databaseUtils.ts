import type { IngredientDatabase, Ingredient } from '../types';
import Fuse from 'fuse.js';

interface IngredientMatch {
  ingredient: Ingredient;
  confidence: number;
}

/**
 * Remove numbers and dashes from a string for base comparison
 */
function getBaseForm(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-\d]+/g, '')
    .trim();
}

/**
 * Find an ingredient by name or synonym in the database
 * Returns both the ingredient and a confidence score
 */
export function findIngredient(
  database: IngredientDatabase,
  searchTerm: string,
): IngredientMatch | undefined {
  const normalizedSearch = searchTerm.toLowerCase();
  const baseSearch = getBaseForm(searchTerm);

  // First try exact matches in main database
  for (const ingredient of Object.values(database.ingredients)) {
    if (ingredient.name.toLowerCase() === normalizedSearch) {
      return { ingredient, confidence: 1.0 };
    }
    if (
      ingredient.synonyms?.some((syn) => syn.toLowerCase() === normalizedSearch)
    ) {
      return { ingredient, confidence: 1.0 };
    }
    // Try base form matches with synonyms
    if (ingredient.synonyms?.some((syn) => getBaseForm(syn) === baseSearch)) {
      return { ingredient, confidence: 0.9 };
    }
  }

  // Special handling for PEG/PPG silicones
  if (normalizedSearch.includes('peg') || normalizedSearch.includes('ppg')) {
    const unknownPegSilicone = Object.values(database.ingredients).find(
      (ingredient) => ingredient.id === 'unknown_peg_silicone',
    );
    if (unknownPegSilicone) {
      return { ingredient: unknownPegSilicone, confidence: 0.9 };
    }
  }

  // Special handling for SD alcohol variations
  if (
    normalizedSearch.includes('sd alcohol') ||
    normalizedSearch.includes('denatured alcohol')
  ) {
    const sdAlcohol = Object.values(database.ingredients).find(
      (ingredient) => ingredient.id === 'sd_alcohol',
    );
    if (sdAlcohol) {
      return { ingredient: sdAlcohol, confidence: 0.9 };
    }
  }

  // Create searchable items from ingredients and their synonyms
  const searchItems = Object.values(database.ingredients).flatMap(
    (ingredient) => {
      const items = [
        {
          text: ingredient.name,
          ingredient,
          isName: true,
        },
      ];

      if (ingredient.synonyms) {
        items.push(
          ...ingredient.synonyms.map((syn) => ({
            text: syn,
            ingredient,
            isName: false,
          })),
        );
      }
      return items;
    },
  );

  // Configure Fuse.js options
  const options = {
    includeScore: true,
    keys: ['text'],
    threshold: 0.4, // Less strict matching
    location: 0, // Start of string
    distance: 100, // How far to look for matches
    minMatchCharLength: 3,
    shouldSort: true,
    findAllMatches: true,
    ignoreLocation: false, // This is important - we want to prioritize matches at the start
    tokenize: true, // Break the search into tokens
    matchAllTokens: false, // Match any token
    tokenSeparator: /[\s-/()]+/, // Split on spaces, hyphens, slashes, and parentheses
  };

  const fuse = new Fuse(searchItems, options);
  const results = fuse.search(searchTerm);

  if (results.length > 0) {
    // Convert Fuse.js score (0-1 where 0 is perfect match) to our confidence score (0-1 where 1 is perfect match)
    const confidence = 1 - (results[0].score || 0);

    // If confidence is too low, don't return a match
    if (confidence < 0.6) {
      return undefined;
    }

    return {
      ingredient: results[0].item.ingredient,
      confidence: confidence,
    };
  }

  return undefined;
}

/**
 * Get category objects for a list of category IDs
 */
export function getIngredientCategories(
  database: IngredientDatabase,
  categoryIds: string | string[],
): string[] {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  return ids.filter((id) => database.categories[id] !== undefined);
}

/**
 * Get unique group IDs for a list of category IDs
 */
export function getCategoryGroups(
  database: IngredientDatabase,
  categoryIds: string[],
): string[] {
  const groups = new Set<string>();

  categoryIds.forEach((categoryId) => {
    const category = database.categories[categoryId];
    if (category) {
      groups.add(category.group);
    }
  });

  return Array.from(groups);
}
