import FlexSearch from 'flexsearch';

import type {
  IngredientDatabase,
  IngredientMatch,
  MatchOptions,
  Ingredient,
} from '../types';

import { generateId } from './idGenerator';

/**
 * IngredientMatcher provides fuzzy search functionality for ingredients using FlexSearch.
 * It maintains an indexed database of ingredients and their synonyms for efficient searching.
 */
export class IngredientMatcher {
  private readonly searchIndex: FlexSearch.Index;
  private readonly ingredientMap: Map<string, Ingredient>;

  constructor(database: IngredientDatabase) {
    this.ingredientMap = new Map();

    // Initialize FlexSearch with optimized settings for ingredient matching
    this.searchIndex = new FlexSearch.Index({
      tokenize: 'full',
      resolution: 9,
      cache: true,
      charset: 'latin:extra',
    });

    this.indexIngredients(database.ingredients);
  }

  /**
   * Indexes all ingredients and their synonyms in the FlexSearch instance
   */
  private indexIngredients(ingredients: Ingredient[]): void {
    ingredients.forEach((ingredient) => {
      const searchText = this.createSearchText(ingredient);
      this.searchIndex.add(ingredient.id, searchText);
      this.ingredientMap.set(ingredient.id, ingredient);
    });
  }

  /**
   * Creates searchable text from an ingredient by combining name and synonyms
   */
  private createSearchText(ingredient: Ingredient): string {
    return [ingredient.name, ...(ingredient.synonyms || [])]
      .join(' ')
      .toLowerCase();
  }

  /**
   * Creates a standardized IngredientMatch object
   */
  private createMatch(params: {
    name: string;
    normalized: string;
    confidence?: number;
    flagged?: boolean;
    details?: Ingredient;
    categories?: string[];
  }): IngredientMatch {
    const { confidence = 0, flagged = false } = params;

    return {
      uuid: generateId(),
      name: params.name,
      normalized: params.normalized,
      matchDetails: {
        matched: confidence > 0,
        flagged,
        confidence,
      },
      details: params.details,
      categories: params.categories,
    };
  }

  /**
   * Searches for an ingredient match based on input text
   * Returns exact matches with higher confidence than fuzzy matches
   */
  search(input: string, options: MatchOptions = {}): IngredientMatch {
    const inputLower = input.toLowerCase();
    const searchResults = this.searchIndex.search(inputLower);

    if (!searchResults.length) {
      return this.createNoMatch(input);
    }

    const exactMatch = this.findExactMatch(inputLower, searchResults);
    if (exactMatch) {
      return this.createMatchWithDebug(exactMatch, input, options);
    }

    return this.createFuzzyMatch(searchResults[0], input, options);
  }

  private createNoMatch(input: string): IngredientMatch {
    return this.createMatch({
      name: input,
      normalized: input,
      confidence: 0,
    });
  }

  /**
   * Attempts to find an exact match among search results
   */
  private findExactMatch(
    input: string,
    searchResults: Array<string | number>
  ): Ingredient | null {
    for (const id of searchResults) {
      const ingredient = this.ingredientMap.get(String(id));
      if (!ingredient) continue;

      const hasExactMatch = [
        ingredient.id,
        ...(ingredient.synonyms || []).map(s => s.toLowerCase())
      ].some(term => term === input);

      if (hasExactMatch) {
        return ingredient;
      }
    }
    return null;
  }

  /**
   * Creates a match result with debug information if requested
   */
  private createMatchWithDebug(
    ingredient: Ingredient,
    input: string,
    options: MatchOptions
  ): IngredientMatch {
    const match = this.createMatch({
      name: input,
      normalized: input,
      confidence: 1,
      details: ingredient,
      categories: ingredient.category,
    });

    if (options.debug) {
      match.debug = this.createDebugInfo(input);
    }

    return match;
  }

  /**
   * Creates a fuzzy match when no exact match is found
   */
  private createFuzzyMatch(
    bestMatchId: string | number,
    input: string,
    options: MatchOptions
  ): IngredientMatch {
    const ingredient = this.ingredientMap.get(String(bestMatchId));
    if (!ingredient) {
      return this.createNoMatch(input);
    }

    const inputLower = input.toLowerCase();
    const matchedTerm = this.findMatchedTerm(ingredient, inputLower);

    const match = this.createMatch({
      name: input,
      normalized: input,
      confidence: 0.8,
      flagged: true,
      details: ingredient,
      categories: ingredient.category,
    });

    if (options.debug) {
      match.debug = this.createDebugInfo(input);
    }

    return match;
  }

  private findMatchedTerm(ingredient: Ingredient, input: string): string {
    return [
      ingredient.id,
      ...(ingredient.synonyms || [])
    ].find(term =>
      input.includes(term.toLowerCase()) ||
      term.toLowerCase().includes(input)
    ) || ingredient.id;
  }

  /**
   * Creates debug information for matches when requested
   */
  private createDebugInfo(input: string) {
    return {
      allMatches: Array.from(this.ingredientMap.values()).map(ingredient =>
        this.createMatch({
          name: input,
          normalized: input,
          confidence: 1,
          flagged: true,
          details: ingredient,
          categories: ingredient.category,
        })
      ),
    };
  }
}

// Singleton instance for performance
let matcher: IngredientMatcher;

/**
 * Matches an ingredient string against the database
 * Creates a singleton matcher instance for better performance
 */
export function matchIngredient(
  input: string,
  database: IngredientDatabase,
  options: MatchOptions = {},
): IngredientMatch {
  if (!matcher) {
    matcher = new IngredientMatcher(database);
  }
  return matcher.search(input, options);
}
