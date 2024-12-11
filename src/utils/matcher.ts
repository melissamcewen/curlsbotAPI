import type {
  IngredientDatabase,
  IngredientMatch,
  MatchDetails,
  MatchOptions,
  Ingredient,
} from '../types';

import { findExactMatch, findPartialMatches, fuzzyMatch } from './matchmethods';
import { generateId } from './idGenerator';

function createMatchDetails(
  matchType: 'exactMatch' | 'partialMatch' | 'fuzzyMatch',
  searchType: 'ingredient' | 'category' | 'categoryGroup',
  confidence: number,
  matchedOn?: string[]
): MatchDetails {
  return {
    matched: true,
    matchTypes: [matchType],
    searchType,
    confidence,
    matchedOn: matchedOn || undefined,
  };
}

export function createMatch(params: {
  name: string;
  normalized: string;
  matchDetails?: MatchDetails;
  details?: Ingredient;
  categories?: string[];
}): IngredientMatch {
  return {
    id: generateId(),
    ...params
  };
}

export function matchIngredient(
  input: string,
  database: IngredientDatabase,
  options: MatchOptions = {},
): IngredientMatch {
  const matches: IngredientMatch[] = [];

  // Try exact ingredient matches
  for (const ingredient of database.ingredients) {
    const exactMatch = findExactMatch(input, ingredient.name, ingredient.synonyms);
    if (exactMatch.matched) {
      matches.push(createMatch({
        name: input,
        normalized: input,
        matchDetails: createMatchDetails('exactMatch', 'ingredient', 1, exactMatch.matchedOn),
        details: ingredient,
        categories: ingredient.category,
      }));
      continue;
    }

    // Try partial matches if configured
    if (ingredient.matchConfig?.partials) {
      const partialMatch = findPartialMatches(input, ingredient.name, ingredient.matchConfig.partials);
      if (partialMatch.matched && partialMatch.matchedOn) {
        matches.push(createMatch({
          name: input,
          normalized: input,
          matchDetails: createMatchDetails('partialMatch', 'ingredient', 0.7, [partialMatch.matchedOn]),
          details: ingredient,
          categories: ingredient.category,
        }));
      }
    }
  }



  // Try fuzzy matches if no other matches found
  if (matches.length === 0) {
    const fuzzyMatches = fuzzyMatch(input, database.ingredients);
    matches.push(...fuzzyMatches.map(fm => createMatch({
      name: input,
      normalized: input,
      matchDetails: createMatchDetails('fuzzyMatch', 'ingredient', 0.6, [fm.matchedOn]),
      details: fm.ingredient,
      categories: fm.ingredient.category,
    })));
  }

  // Sort matches by confidence
  matches.sort((a, b) => (b.matchDetails?.confidence || 0) - (a.matchDetails?.confidence || 0));

  // Return highest confidence match or create empty match
  const result = matches[0] || createMatch({
    name: input,
    normalized: input,
  });

  // Add debug info if requested
  if (options.debug) {
    result.debug = { allMatches: matches };
  }

  return result;
}
