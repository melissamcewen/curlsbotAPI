import FlexSearch from 'flexsearch';

import type {
  IngredientDatabase,
  IngredientMatch,
  MatchDetails,
  MatchOptions,
  Ingredient,
} from '../types';

import { generateId } from './idGenerator';

// Create a class to handle FlexSearch indexing and searching
export class IngredientMatcher {
  private idx: FlexSearch.Index; // FlexSearch index
  private ingredientMap: Map<string, Ingredient>;

  constructor(database: IngredientDatabase) {
    this.ingredientMap = new Map();

    // Initialize FlexSearch with basic Index
    this.idx = new FlexSearch.Index({
      tokenize: 'full',
      resolution: 9,
      cache: true,
      charset: "latin:extra"
    });

    // Index each ingredient
    database.ingredients.forEach((ingredient) => {
      const searchText = [
        ingredient.name,
        ...(ingredient.synonyms || [])
      ].join(' ').toLowerCase();

      this.idx.add(ingredient.id, searchText);
      this.ingredientMap.set(ingredient.id, ingredient);
    });
  }

  search(input: string, options: MatchOptions = {}): IngredientMatch {
    const searchResults = this.idx.search(input.toLowerCase());

    if (!searchResults.length) {
      return createMatch({
        name: input,
        normalized: input,
      });
    }

    // Get the best match
    const bestMatchId = searchResults[0];
    const ingredient = this.ingredientMap.get(String(bestMatchId));

    if (!ingredient) {
      return createMatch({
        name: input,
        normalized: input,
      });
    }

    // Find which term was matched
    const matchedTerm = [ingredient.name.toLowerCase(), ...(ingredient.synonyms || [])].find(
      term => input.toLowerCase().includes(term.toLowerCase())
    ) || ingredient.name;

    const match = createMatch({
      name: input,
      normalized: input,
      matchDetails: {
        matched: true,
        confidence: 1,
        matchedOn: [matchedTerm]
      },
      details: ingredient,
      categories: ingredient.category,
    });

    // Add debug info if requested
    if (options.debug) {
      match.debug = {
        allMatches: searchResults.map((id: string | number) => {
          const matchIngredient = this.ingredientMap.get(String(id));
          return createMatch({
            name: input,
            normalized: input,
            matchDetails: createMatchDetails(1, [matchIngredient?.name || '']),
            details: matchIngredient,
            categories: matchIngredient?.category,
          });
        }),
      };
    }

    return match;
  }
}

function createMatchDetails(
  confidence: number,
  matchedOn?: string[],
): MatchDetails {
  return {
    matched: true,
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
    ...params,
  };
}

// Export a singleton instance of the matcher
let matcher: IngredientMatcher;

export function matchIngredient(
  input: string,
  database: IngredientDatabase,
  options: MatchOptions = {},
): IngredientMatch {
  // Initialize matcher if not already done
  if (!matcher) {
    matcher = new IngredientMatcher(database);
  }

  return matcher.search(input, options);
}
