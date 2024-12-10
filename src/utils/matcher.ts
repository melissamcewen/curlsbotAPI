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
} from '../types';
import { generateId } from './idGenerator';

/**
 * Creates a standardized ingredient match object
 *
 * @param input - The original ingredient string that was matched
 * @param matchDetails - Details about how the match was found (confidence, type, etc.)
 * @param details - Full ingredient details if matched against database
 * @param categories - Categories this ingredient belongs to
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
function createMatch(
  input: string,
  matchDetails?: MatchDetails,
  details?: Ingredient,
  categories?: string[],
): IngredientMatch {
  return {
    id: generateId(),
    name: input,
    normalized: input,
    details,
    categories,
    matchDetails,
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
           input,
           {
             matched: true,
             matchTypes: ['exactMatch'],
             searchType: 'ingredient',
             confidence: 1,
             matchedOn: exactMatch.matchedOn,
           },
           ingredient,
           ingredient.category,
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
             input,
             {
               matched: true,
               matchTypes: ['partialMatch'],
               searchType: 'ingredient',
               confidence: 0.7,
               matchedOn: partialMatch.matchedOn
                 ? [partialMatch.matchedOn]
                 : undefined,
             },
             ingredient,
             ingredient.category,
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
      if (input.toLowerCase() === catName.toLowerCase()) {
        matches.push(
          createMatch(
            input,
            {
              matched: true,
              matchTypes: ['exactMatch'],
              searchType: 'category',
              confidence: 0.8,
              matchedOn: [catName],
            },
            undefined,
            [catName],
          ),
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
              input,
              {
                matched: true,
                matchTypes: ['partialMatch'],
                searchType: 'category',
                confidence: 0.6,
                matchedOn: partialMatch.matchedOn
                  ? [partialMatch.matchedOn]
                  : undefined,
              },
              undefined,
              [catName],
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
            input,
            {
              matched: true,
              matchTypes: ['partialMatch'],
              searchType: 'categoryGroup',
              confidence: 0.5,
              matchedOn: [group.name],
            },
            undefined,
            [`unknown ${group.name}`],
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
          input,
          {
            matched: true,
            matchTypes: ['fuzzyMatch'],
            searchType: 'ingredient',
            confidence: 0.6,
            matchedOn: [fm.matchedOn],
          },
          fm.ingredient,
          fm.ingredient.category,
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
  const result = matches[0] || createMatch(input);

  // Add debug info if requested
  if (options.debug) {
    result.debug = {
      allMatches: matches,
    };
  }

  return result;
}
