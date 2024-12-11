import {
  findExactMatch,
  findPartialMatches,
  regexMatch,
  fuzzyMatch,
} from './matchtypes';
import type {
  IngredientDatabase,
  IngredientMatch,
  MatchDetails,
  MatchOptions,
  Ingredient,
  CategoryGroup,
  Category,
} from '../types';
import { generateId } from './idGenerator';

// Add a simple cache at the top of the file
const normalizedCache = new Map<string, string>();

// Create a function to handle normalization with caching
function getNormalizedString(input: string): string {
  if (normalizedCache.has(input)) {
    return normalizedCache.get(input)!;
  }
  const normalized = input.toLowerCase().trim();
  normalizedCache.set(input, normalized);
  return normalized;
}

// Add type and interface at the top
export interface IndexedDatabase extends IngredientDatabase {
  ingredientIndex: Map<string, Ingredient>;
  synonymIndex: Map<string, Ingredient>;
}

export interface CategoryIndex {
  exact: Map<string, string[]>;
  partial: Map<string, Array<{pattern: RegExp; categories: string[]}>>;
}

// Create an indexing function
export function createIndexedDatabase(database: IngredientDatabase): IndexedDatabase {
  const ingredientIndex = new Map<string, Ingredient>();
  const synonymIndex = new Map<string, Ingredient>();

  database.ingredients.forEach(ingredient => {
    ingredientIndex.set(ingredient.name.toLowerCase(), ingredient);
    ingredient.synonyms?.forEach(synonym => {
      synonymIndex.set(synonym.toLowerCase(), ingredient);
    });
  });

  return {
    ...database,
    ingredientIndex,
    synonymIndex
  };
}

/**
 * Creates a standardized ingredient match object
 *
 * @param params - The original ingredient string that was matched
 * @param params.name - The original ingredient string that was matched
 * @param params.normalized - The normalized ingredient string that was matched
 * @param params.matchDetails - Details about how the match was found (confidence, type, etc.)
 * @param params.details - Full ingredient details if matched against database
 * @param params.categories - Categories this ingredient belongs to
 *
 * @returns A complete IngredientMatch object with a unique ID
 *
 * @example
 * ```ts
 * createMatch('cetyl alcohol', {
 *   matched: true,
 *   matchTypes: ['exactMatch'],
 *   searchType: 'ingredient',
 *   confidence: 1,
 *   matchedOn: ['Cetyl Alcohol']
 * }, ingredientDetails, ['fatty alcohol']);
 * ```
 */
export function createMatch(params: {
  name: string;
  normalized: string;
  matchDetails?: MatchDetails;
  details?: Ingredient;
  categories?: string[];
}): IngredientMatch {
  return {
    id: generateId(),
    name: params.name,
    normalized: params.normalized,
    details: params.details,
    categories: params.categories,
    matchDetails: params.matchDetails,
  };
}

/**
 * Matches an ingredient string against the ingredient database
 *
 * @remarks
 * The matching process follows this order and returns the highest confidence match:
 * 1. Exact ingredient matches (confidence: 1.0, searchType: 'ingredient')
 * 2. Partial ingredient matches (confidence: 0.7, searchType: 'ingredient')
 * 3. Category exact matches (confidence: 0.8, searchType: 'category')
 * 4. Category partial matches (confidence: 0.6, searchType: 'category')
 * 5. Category group matches (confidence: 0.5, searchType: 'categoryGroup')
 *
 * @param input - The ingredient string to match
 * @param database - The ingredient database to match against
 * @param options - Optional configuration
 * @param options.debug - If true, includes all possible matches in debug info
 *
 * @returns The highest confidence match
 */
export function matchIngredient(
  input: string,
  database: IndexedDatabase,
  options: MatchOptions = {},
): IngredientMatch {
  const normalized = getNormalizedString(input);
  const matches: IngredientMatch[] = [];

  // Check exact matches first using indices
  const exactIngredient = database.ingredientIndex.get(normalized);
  if (exactIngredient) {
    const match = createMatch({
      name: input,
      normalized,
      matchDetails: {
        matched: true,
        matchTypes: ['exactMatch'],
        searchType: 'ingredient',
        confidence: 1,
        matchedOn: [exactIngredient.name],
      },
      details: exactIngredient,
      categories: exactIngredient.category,
    });
    matches.push(match);

    // If we have an exact match but debug is enabled, continue looking for other matches
    if (!options.debug) {
      return match;
    }
  }

  // Check synonym matches
  const synonymMatch = database.synonymIndex.get(normalized);
  if (synonymMatch) {
    const match = createMatch({
      name: input,
      normalized,
      matchDetails: {
        matched: true,
        matchTypes: ['exactMatch'],
        searchType: 'ingredient',
        confidence: 1,
        matchedOn: [synonymMatch.name],
      },
      details: synonymMatch,
      categories: synonymMatch.category,
    });
    matches.push(match);

    // If we have a synonym match but debug is enabled, continue looking for other matches
    if (!options.debug) {
      return match;
    }
  }

  // Continue with partial matches only if no exact match found...

  // Try fuzzy matches first
  const fuzzyMatches = fuzzyMatch(normalized, database.ingredients);
  if (fuzzyMatches.length > 0) {
    matches.push(
      ...fuzzyMatches.map((fm) =>
        createMatch({
          name: input,
          normalized,
          matchDetails: {
            matched: true,
            matchTypes: ['fuzzyMatch'],
            searchType: 'ingredient',
            confidence: 0.6,
            matchedOn: [fm.matchedOn],
          },
          details: fm.ingredient,
        }),
      ),
    );
  }

  // Then try partial matches
  for (const ingredient of database.ingredients) {
    if (ingredient.matchConfig?.partials) {
      const partialMatch = findPartialMatches(
        normalized,
        ingredient.name,
        ingredient.matchConfig.partials
      );
      if (partialMatch.matched) {
        matches.push(
          createMatch({
            name: input,
            normalized,
            matchDetails: {
              matched: true,
              matchTypes: ['partialMatch'],
              searchType: 'ingredient',
              confidence: 0.7,
              matchedOn: [partialMatch.matchedOn || ingredient.name],
            },
            details: ingredient,
          }),
        );
      }
    }
  }

  // Try category group matches first
  for (const [groupName, group] of Object.entries(database.categories) as [string, CategoryGroup][]) {
    if (group.matchConfig?.partials) {
      const groupMatch = findPartialMatches(
        normalized,
        group.name,
        group.matchConfig.partials,
      );
      if (groupMatch.matched) {
        matches.push(
          createMatch({
            name: input,
            normalized,
            matchDetails: {
              matched: true,
              matchTypes: ['partialMatch'],
              searchType: 'categoryGroup',
              confidence: 0.5,
              matchedOn: [group.name],
            },
            categories: [`unknown ${group.name}`],
          }),
        );
      }
    }

    // Only check categories that have matchConfig
    for (const [catName, category] of Object.entries(group.categories) as [string, Category][]) {
      if (!category.matchConfig) continue;

      // Try exact category matches
      if (category.matchConfig?.matchType?.includes('exactMatch')) {
        if (normalized === category.name.toLowerCase()) {
          matches.push(
            createMatch({
              name: input,
              normalized,
              matchDetails: {
                matched: true,
                matchTypes: ['exactMatch'],
                searchType: 'category',
                confidence: 0.8,
                matchedOn: [category.name],
              },
              categories: [category.name],
            }),
          );
        }
      }

      // Try partial category matches
      if (category.matchConfig.partials) {
        const partialMatch = findPartialMatches(
          normalized,
          catName,
          category.matchConfig.partials,
        );
        if (partialMatch.matched) {
          matches.push(
            createMatch({
              name: input,
              normalized,
              matchDetails: {
                matched: true,
                matchTypes: ['partialMatch'],
                searchType: 'category',
                confidence: 0.6,
                matchedOn: partialMatch.matchedOn ? [partialMatch.matchedOn] : undefined,
              },
              categories: [catName],
            }),
          );
        }
      }
    }
  }

  // Sort matches by confidence
  matches.sort(
    (a, b) =>
      (b.matchDetails?.confidence || 0) - (a.matchDetails?.confidence || 0),
  );

  // Create base result
  const result = matches[0] || createMatch({
    name: input,
    normalized,
  });

  // Always add debug info if requested
  if (options.debug) {
    result.debug = {
      allMatches: matches.length > 0 ? matches : [result]
    };
  }

  return result;
}

let fuseInstance: any = null;

function getFuzzyMatcher(ingredients: Ingredient[]) {
  if (!fuseInstance) {
    const Fuse = require('fuse.js');
    fuseInstance = new Fuse(ingredients, {
      keys: ['name', 'synonyms'],
      threshold: 0.3,
      distance: 100
    });
  }
  return fuseInstance;
}

export function matchIngredients(
  inputs: string[],
  database: IndexedDatabase,
  options: MatchOptions = {},
): IngredientMatch[] {
  // Process in chunks to avoid blocking
  const chunkSize = 100;
  const results: IngredientMatch[] = [];

  for (let i = 0; i < inputs.length; i += chunkSize) {
    const chunk = inputs.slice(i, i + chunkSize);
    const chunkResults = chunk.map(input =>
      matchIngredient(input, database, options)
    );
    results.push(...chunkResults);
  }

  return results;
}

export function createCategoryIndex(database: IngredientDatabase): CategoryIndex {
  const exact = new Map<string, string[]>();
  const partial = new Map<string, Array<{pattern: RegExp; categories: string[]}>>();

  Object.entries(database.categories).forEach(([groupName, group]) => {
    Object.entries(group.categories).forEach(([catName, category]) => {
      if (category.matchConfig?.matchType?.includes('exactMatch')) {
        exact.set(category.name.toLowerCase(), [catName]);
      }
      if (category.matchConfig?.partials) {
        category.matchConfig.partials.forEach(pattern => {
          const regex = new RegExp(pattern, 'i');
          const existing = partial.get(groupName) || [];
          existing.push({ pattern: regex, categories: [catName] });
          partial.set(groupName, existing);
        });
      }
    });
  });

  return { exact, partial };
}
