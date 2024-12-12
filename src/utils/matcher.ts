import lunr from 'lunr';

import type {
  IngredientDatabase,
  IngredientMatch,
  MatchDetails,
  MatchOptions,
  Ingredient,
} from '../types';

import { generateId } from './idGenerator';

// Create a class to handle Lunr indexing and searching
export class IngredientMatcher {
  private idx: lunr.Index;
  private ingredientMap: Map<string, Ingredient>;

  constructor(database: IngredientDatabase) {
    this.ingredientMap = new Map();

    // Build the Lunr index
    const ingredientMap = this.ingredientMap;
    this.idx = lunr(function () {
      this.field('searchableText', { boost: 10 });
      this.field('name', { boost: 5 });
      this.field('synonyms', { boost: 5 });

      // Add ref field which will be the ingredient ID
      this.ref('id');

      // Index each ingredient
      database.ingredients.forEach((ingredient) => {
        this.add({
          id: ingredient.id,
          name: ingredient.name,
          searchableText: ingredient.name,
          synonyms: ingredient.synonyms?.join(' ') || '',
        });

        // Store the full ingredient data in the map
        ingredientMap.set(ingredient.id, ingredient);
      });
    });
  }

  search(input: string, options: MatchOptions = {}): IngredientMatch {
    const terms = input.toLowerCase().split(' ');
    const searchQuery = terms.map(term => `${term}~1`).join(' ');
    const searchResults = this.idx.search(searchQuery);

    if (searchResults.length === 0) {
      return createMatch({
        name: input,
        normalized: input,
      });
    }

    // Get the best match
    const bestMatch = searchResults[0];
    const ingredient = this.ingredientMap.get(bestMatch.ref);

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

    // Calculate confidence based on score
    const confidence = Math.min(bestMatch.score, 1);

    const match = createMatch({
      name: input,
      normalized: input,
      matchDetails: {
        matched: searchResults.length > 0,
        confidence,
        matchedOn: [matchedTerm]
      },
      details: ingredient,
      categories: ingredient.category,
    });

    // Add debug info if requested
    if (options.debug) {
      match.debug = {
        allMatches: searchResults.map((result) => ({
          ...createMatch({
            name: input,
            normalized: input,
            matchDetails: createMatchDetails(
              result.score,
              [ingredient.name],
            ),
            details: this.ingredientMap.get(result.ref),
            categories: this.ingredientMap.get(result.ref)?.category,
          }),
        })),
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
