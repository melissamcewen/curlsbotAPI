import type {
  IngredientDatabase,
  IngredientMatch,
  MatchDetails,
  MatchOptions,
  Ingredient,
} from '../types';

import { findExactMatch, findPartialMatches, fuzzyMatch } from './matchmethods';
import { generateId } from './idGenerator';

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
  database: IngredientDatabase,
  options: MatchOptions = {},
): IngredientMatch {
  const matches: IngredientMatch[] = [];

  // First try to match against known ingredients and their synonyms
  for (const ingredient of database.ingredients) {
    // Try exact matches first
    const exactMatch = findExactMatch(
       input,
       ingredient.name,
       ingredient.synonyms,
     );
     if (exactMatch.matched) {
       matches.push(
         createMatch(
           {
             name: input,
             normalized: input,
             matchDetails: {
               matched: true,
               matchTypes: ['exactMatch'],
               searchType: 'ingredient',
               confidence: 1,
               matchedOn: exactMatch.matchedOn,
             },
             details: ingredient,
             categories: ingredient.category,
           },
         ),
       );
       continue; // Skip other checks if we found an exact match
     }

     // Try partial matches if configured
     if (ingredient.matchConfig?.partials) {
       const partialMatch = findPartialMatches(
         input,
         ingredient.name,
         ingredient.matchConfig.partials,
       );
       if (partialMatch.matched) {
         matches.push(
           createMatch(
             {
               name: input,
               normalized: input,
               matchDetails: {
                 matched: true,
                 matchTypes: ['partialMatch'],
                 searchType: 'ingredient',
                 confidence: 0.7,
                 matchedOn: partialMatch.matchedOn
                   ? [partialMatch.matchedOn]
                   : undefined,
               },
               details: ingredient,
               categories: ingredient.category,
             },
           ),
         );
       }
     }
   }

  // Then try to match against categories that have matchConfig
  for (const [groupName, group] of Object.entries(database.categories)) {
    // Only check categories that have matchConfig
    for (const [catName, category] of Object.entries(group.categories)) {
      if (!category.matchConfig) continue;

      // Try exact category matches
      if (!category.matchConfig?.matchType?.includes('exactMatch')) continue;

      if (input === category.name.toLowerCase()) {
        matches.push(
          createMatch({
            name: input,
            normalized: input,
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

      // Try partial category matches
      if (category.matchConfig.partials) {
        const partialMatch = findPartialMatches(
          input,
          catName,
          category.matchConfig.partials,
        );
        if (partialMatch.matched) {
          matches.push(
            createMatch(
              {
                name: input,
                normalized: input,
                matchDetails: {
                  matched: true,
                  matchTypes: ['partialMatch'],
                  searchType: 'category',
                  confidence: 0.6,
                  matchedOn: partialMatch.matchedOn
                    ? [partialMatch.matchedOn]
                    : undefined,
                },
                details: undefined,
                categories: [catName],
              },
            ),
          );
        }
      }
    }

    // Only try category group matches if group has matchConfig
    if (group.matchConfig?.partials) {
      const groupMatch = findPartialMatches(
        input,
        group.name,
        group.matchConfig.partials,
      );
      if (groupMatch.matched) {
        matches.push(
          createMatch(
            {
              name: input,
              normalized: input,
              matchDetails: {
                matched: true,
                matchTypes: ['partialMatch'],
                searchType: 'categoryGroup',
                confidence: 0.5,
                matchedOn: [group.name],
              },
              details: undefined,
              categories: [`unknown ${group.name}`],
            },
          ),
        );
      }
    }
  }
  if (matches.length === 0) {
    const fuzzyMatches = fuzzyMatch(input, database.ingredients);
    matches.push(
      ...fuzzyMatches.map((fm) =>
        createMatch(
          {
            name: input,
            normalized: input,
            matchDetails: {
              matched: true,
              matchTypes: ['fuzzyMatch'],
              searchType: 'ingredient',
              confidence: 0.6,
              matchedOn: [fm.matchedOn],
            },
            details: fm.ingredient,
            categories: fm.ingredient.category,
          },
        ),
      ),
    );
  }

  // Sort matches by confidence
  matches.sort(
    (a, b) =>
      (b.matchDetails?.confidence || 0) - (a.matchDetails?.confidence || 0),
  );

  // Create base result
  const result = matches[0] || createMatch({
    name: input,
    normalized: input,
    matchDetails: undefined,
    details: undefined,
    categories: undefined,
  });

  // Add debug info if requested
  if (options.debug) {
    result.debug = {
      allMatches: matches,
    };
  }

  return result;
}
