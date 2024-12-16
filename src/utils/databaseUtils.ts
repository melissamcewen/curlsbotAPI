import { randomUUID } from 'crypto';

import type { IngredientDatabase, IngredientMatch } from '../types';

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
      return {
        uuid: randomUUID(),
        input: searchTerm,
        normalized: normalizedSearch,
        ingredient,
        categories: ingredient.categories,
        confidence: 1.0,
      };
    }
    if (
      ingredient.synonyms?.some((syn) => syn.toLowerCase() === normalizedSearch)
    ) {
      return {
        uuid: randomUUID(),
        input: searchTerm,
        normalized: normalizedSearch,
        ingredient,
        categories: ingredient.categories,
        confidence: 1.0,
      };
    }
    // Try base form matches with synonyms
    if (ingredient.synonyms?.some((syn) => getBaseForm(syn) === baseSearch)) {
      return {
        uuid: randomUUID(),
        input: searchTerm,
        normalized: normalizedSearch,
        ingredient,
        categories: ingredient.categories,
        confidence: 0.9,
      };
    }
  }

  // Try partial matches
  for (const ingredient of Object.values(database.ingredients)) {
    // Check if search term is contained in ingredient name
    if (ingredient.name.toLowerCase().includes(normalizedSearch)) {
      return {
        uuid: randomUUID(),
        input: searchTerm,
        normalized: normalizedSearch,
        ingredient,
        categories: ingredient.categories,
        confidence: 0.8,
      };
    }
    // Check if search term is contained in any synonym
    if (
      ingredient.synonyms?.some((syn) =>
        syn.toLowerCase().includes(normalizedSearch),
      )
    ) {
      return {
        uuid: randomUUID(),
        input: searchTerm,
        normalized: normalizedSearch,
        ingredient,
        categories: ingredient.categories,
        confidence: 0.7,
      };
    }
  }

  // Check for PEG/PPG silicones first
  const pegMatch = pegSiliconeMatch(searchTerm, database);
  if (pegMatch) {
    return pegMatch;
  }

  /// if the search term is longer than 20 characters, try to see if any ingredients are contained in the search term
  if (searchTerm.length > 20) {
    for (const ingredient of Object.values(database.ingredients)) {
      // Check if ingredient name is contained in search term
      if (normalizedSearch.includes(ingredient.name.toLowerCase())) {
        return {
          uuid: randomUUID(),
          input: searchTerm,
          normalized: normalizedSearch,
          ingredient,
          categories: ingredient.categories,
          confidence: 0.6,
        };
      }
      // Check if any synonyms are contained in the search term
      if (
        ingredient.synonyms?.some((syn) =>
          normalizedSearch.includes(syn.toLowerCase()),
        )
      ) {
        return {
          uuid: randomUUID(),
          input: searchTerm,
          normalized: normalizedSearch,
          ingredient,
          categories: ingredient.categories,
          confidence: 0.5,
        };
      }
    }
  }
  // do a simple fuzzy match to check for misspellings
  const fuzzyMatchResult = doFuzzyMatch(searchTerm, database);
  if (fuzzyMatchResult) {
    return fuzzyMatchResult;
  }
  // check if the first word of the search term is contained in any ingredient name
  const firstWord = normalizedSearch.split(' ')[0] ?? '';
  if (firstWord.length > 2) {
    // Only check if first word is longer than 2 characters
    for (const ingredient of Object.values(database.ingredients)) {
      if (ingredient.name.toLowerCase().includes(firstWord)) {
        return {
          uuid: randomUUID(),
          input: searchTerm,
          normalized: normalizedSearch,
          ingredient,
          categories: ingredient.categories,
          confidence: 0.65,
        };
      }
      // Check if first word is in any synonym
      if (
        ingredient.synonyms?.some((syn) =>
          syn.toLowerCase().includes(firstWord),
        )
      ) {
        return {
          uuid: randomUUID(),
          input: searchTerm,
          normalized: normalizedSearch,
          ingredient,
          categories: ingredient.categories,
          confidence: 0.55,
        };
      }
    }
  }

  // utilize the UnknownIngredientMatch function
  const unknownMatch = unknownIngredientMatch(searchTerm, database);
  if (unknownMatch) {
    return unknownMatch;
  }

  return undefined;
}

function doFuzzyMatch(
  searchTerm: string,
  database: IngredientDatabase,
): IngredientMatch | undefined {
  const normalizedSearch = searchTerm.toLowerCase();
  let bestMatch = undefined;
  let bestDistance = Infinity;

  for (const ingredient of Object.values(database.ingredients)) {
    const distance = levenshteinDistance(normalizedSearch, ingredient.name.toLowerCase());
    if (distance < bestDistance && distance <= 2) { // Allow up to 2 character differences
      bestDistance = distance;
      bestMatch = ingredient;
    }
  }

  if (bestMatch) {
    return {
      uuid: randomUUID(),
      input: searchTerm,
      normalized: normalizedSearch,
      ingredient: bestMatch,
      categories: bestMatch.categories,
      confidence: 0.4 // Lower confidence for fuzzy matches
    };
  }
  return undefined;
}

export function levenshteinDistance(a: string, b: string): number {
  // Create matrix with proper initialization
  const matrix = new Array(a.length + 1);
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = new Array(b.length + 1);
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return matrix[a.length][b.length];
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

export function pegSiliconeMatch(
  searchTerm: string,
  database: IngredientDatabase,
): IngredientMatch | undefined {
  const normalizedSearch = searchTerm.toLowerCase();
  if (normalizedSearch.includes('peg') || normalizedSearch.includes('ppg')) {
    const unknownPegSilicone = Object.values(database.ingredients).find(
      (ingredient) => ingredient.id === 'unknown_peg_silicone',
    );
    if (!unknownPegSilicone) return undefined;
    return {
      uuid: randomUUID(),
      input: searchTerm,
      normalized: normalizedSearch,
      ingredient: unknownPegSilicone,
      confidence: 0.9
    };
  }
  return undefined;
}

// * Special handling for various ingredients returns an ingredient match object */
export function unknownIngredientMatch(
  searchTerm: string,
  database: IngredientDatabase,
): IngredientMatch | undefined {
  const normalizedSearch = searchTerm.toLowerCase();

  // if it contains alcohol return unknown_alcohol
  if (normalizedSearch.includes('alcohol')) {
    const unknownAlcohol = Object.values(database.ingredients).find(
      (ingredient) => ingredient.id === 'unknown_alcohol',
    );
    if (!unknownAlcohol) return undefined;
    return {
      uuid: randomUUID(),
      input: searchTerm,
      normalized: normalizedSearch,
      ingredient: unknownAlcohol,
      confidence: 0.9
    };
  }

  // if it contains 'paraben' return unknown_paraben
  if (normalizedSearch.includes('paraben')) {
    const unknownParaben = Object.values(database.ingredients).find(
      (ingredient) => ingredient.id === 'unknown_paraben',
    );
    if (!unknownParaben) return undefined;
    return {
      uuid: randomUUID(),
      input: searchTerm,
      normalized: normalizedSearch,
      ingredient: unknownParaben,
      confidence: 0.9
    };
  }

  // Check for unknown non-water soluble silicones
  const unknownNonWaterSolubleSilicones = Object.values(database.ingredients).find(
    (ingredient) => ingredient.id === 'unknown_non_water_soluble_silicones',
  );

  if (unknownNonWaterSolubleSilicones?.synonyms?.some(synonym =>
    normalizedSearch.includes(synonym.toLowerCase())
  )) {
    return {
      uuid: randomUUID(),
      input: searchTerm,
      normalized: normalizedSearch,
      ingredient: unknownNonWaterSolubleSilicones,
      confidence: 0.9
    };
  }
  // Check for unknown sulfates
  const unknownSulfate = Object.values(database.ingredients).find(
    (ingredient) => ingredient.id === 'unknown_sulfate',
  );

  if (unknownSulfate?.synonyms?.some(synonym =>
    normalizedSearch.includes(synonym.toLowerCase())
  ) || normalizedSearch.includes('sulfate')) {
    return {
      uuid: randomUUID(),
      input: searchTerm,
      normalized: normalizedSearch,
      ingredient: unknownSulfate,
      confidence: 0.9
    };
  }
  return undefined;
}


