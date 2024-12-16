import type { IngredientDatabase, Ingredient } from '../types';

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
 * Calculate similarity score between 0 and 1
 */
function calculateSimilarity(searchTerm: string, target: string): number {
  const s1 = searchTerm.toLowerCase();
  const s2 = target.toLowerCase();

  // Exact match
  if (s1 === s2) {
    console.log(`Exact match for ${s1} and ${s2}: 1.0`);
    return 1.0;
  }

  // Compare base forms (ignoring numbers and dashes)
  const base1 = getBaseForm(s1);
  const base2 = getBaseForm(s2);

  if (base1 === base2) {
    console.log(`Base form match for ${s1} and ${s2}: 0.9`);
    return 0.9; // Match ignoring numbers
  }

  // For multi-word strings, check if all words from one are in the other
  // Split on spaces and hyphens to handle hyphenated words
  const words1 = s1.split(/[\s-/]+/);
  const words2 = s2.split(/[\s-/]+/);

  // Check for prefix matches at the start of the first word
  // This is important for ingredients that start with modifiers like PEG/PPG
  const firstWord1 = words1[0];
  const firstWord2 = words2[0];
  if (firstWord1 && firstWord2) {
    if (firstWord1.startsWith(firstWord2) || firstWord2.startsWith(firstWord1)) {
      console.log(`First word prefix match for ${s1} and ${s2}: 0.95`);
      return 0.95; // Highest priority after exact match
    }
  }

  // Check for consecutive word matches at the start
  let startingConsecutiveMatch = 0;
  while (
    startingConsecutiveMatch < Math.min(words1.length, words2.length) &&
    words1[startingConsecutiveMatch] === words2[startingConsecutiveMatch]
  ) {
    startingConsecutiveMatch++;
  }

  if (startingConsecutiveMatch >= 2) {
    console.log(`Starting consecutive word match for ${s1} and ${s2}: 0.9`);
    return 0.9; // Two or more consecutive words match at start
  }

  // Check for consecutive word matches anywhere
  let maxConsecutiveMatch = 0;
  for (let i = 0; i < words1.length; i++) {
    for (let j = 0; j < words2.length; j++) {
      let consecutiveMatch = 0;
      while (
        i + consecutiveMatch < words1.length &&
        j + consecutiveMatch < words2.length &&
        words1[i + consecutiveMatch] === words2[j + consecutiveMatch]
      ) {
        consecutiveMatch++;
      }
      maxConsecutiveMatch = Math.max(maxConsecutiveMatch, consecutiveMatch);
    }
  }

  if (maxConsecutiveMatch >= 2) {
    console.log(`Consecutive word match for ${s1} and ${s2}: 0.85`);
    return 0.85; // Two or more consecutive words match but not at start
  }

  // If no good consecutive matches, check for word presence
  const words1InWords2 = words1.every((word) => words2.includes(word));
  const words2InWords1 = words2.every((word) => words1.includes(word));

  if (words1InWords2 && words2InWords1) {
    console.log(`All words match for ${s1} and ${s2}: 0.8`);
    return 0.8; // All words match but not in sequence
  }
  if (words2InWords1) {
    console.log(`Search contains all target words for ${s1} and ${s2}: 0.75`);
    return 0.75; // Search contains all target words
  }
  if (words1InWords2) {
    console.log(`Target contains all search words for ${s1} and ${s2}: 0.7`);
    return 0.7; // Target contains all search words
  }

  // Check for prefix matches at word boundaries
  const searchWords = s1.split(/\s+/);
  const targetWords = s2.split(/\s+/);
  for (const targetWord of targetWords) {
    if (targetWord.endsWith('-')) {
      const prefix = targetWord.slice(0, -1).toLowerCase();
      for (const searchWord of searchWords) {
        if (searchWord.toLowerCase().startsWith(prefix)) {
          console.log(`Prefix match for ${s1} and ${s2}: 0.65`);
          return 0.65; // Lower priority for prefix matches
        }
      }
    }
  }

  // Check for substring matches - lowest priority
  if (s1.includes(s2) || s2.includes(s1)) {
    console.log(`Substring match for ${s1} and ${s2}: 0.6`);
    return 0.6; // One string is a complete substring of the other
  }

  console.log(`No match for ${s1} and ${s2}: 0`);
  return 0; // No match
}

/**
 * Find an ingredient by name or synonym in the database
 * Returns both the ingredient and a confidence score
 * Confidence levels:
 * - 1.0: Exact match
 * - 0.9: Base form match (ignoring numbers)
 * - 0.85: All words match in both directions
 * - 0.8: Search contains all target words
 * - 0.7: Target contains all search words
 * - 0.65: Search contains target as substring
 * - 0.6: Target contains search as substring
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

    if (
      maxSimilarity > 0 &&
      (!bestMatch || maxSimilarity > bestMatch.confidence)
    ) {
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
