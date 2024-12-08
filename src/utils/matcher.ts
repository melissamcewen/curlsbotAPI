import { findExactMatch, findPartialMatches, regexMatch, fuzzyMatch } from './matchtypes';
import type { IngredientDatabase, IngredientMatch, MatchDetails } from '../types';

/**
 * Matches an ingredient string against the ingredient database
 *
 * @remarks
 * The matching process follows this order:
 * 1. Exact ingredient matches (confidence: 1.0, searchType: 'ingredient')
 * 2. Partial ingredient matches (confidence: 0.7, searchType: 'ingredient')
 * 3. Category exact matches (confidence: 0.8, searchType: 'category')
 * 4. Category partial matches (confidence: 0.6, searchType: 'category')
 * 5. Category group matches (confidence: 0.5, searchType: 'categoryGroup')
 *
 * Each match includes a searchType indicating what type of entity was matched:
 * - 'ingredient': Direct match with an ingredient or its synonyms
 * - 'category': Match with a specific category
 * - 'categoryGroup': Match with a category group
 *
 * @param input - The ingredient string to match
 * @param database - The ingredient database to match against
 *
 * @returns An array of matches sorted by confidence (highest first)
 * If no matches are found, returns an array with basic ingredient info
 *
 * @example
 * ```ts
 * const matches = matchIngredient("alcohol denat", database);
 * // Returns matches like:
 * // [{
 * //   name: "alcohol denat",
 * //   normalized: "alcohol denat",
 * //   details: { ... },
 * //   categories: ["drying alcohol"],
 * //   matchDetails: {
 * //     matched: true,
 * //     matchTypes: ["exactMatch"],
 * //     searchType: "ingredient",
 * //     confidence: 1,
 * //     matchedOn: ["alcohol denat"]
 * //   }
 * // }]
 * ```
 */
export function matchIngredient(input: string, database: IngredientDatabase): IngredientMatch[] {
  const matches: IngredientMatch[] = [];

  // First try to match against known ingredients and their synonyms
  for (const [name, ingredient] of Object.entries(database.ingredients)) {
    // Try exact matches first
    const exactMatch = findExactMatch(input, ingredient.name, ingredient.synonyms);
    if (exactMatch.matched) {
      matches.push({
        name: input,
        normalized: input,
        details: ingredient,
        categories: ingredient.category,
        matchDetails: {
          matched: true,
          matchTypes: ['exactMatch'],
          searchType: 'ingredient',
          confidence: 1,
          matchedOn: exactMatch.matchedOn
        }
      });
      continue; // Skip other checks if we found an exact match
    }

    // Try partial matches if configured
    if (ingredient.matchConfig?.partials) {
      const partialMatch = findPartialMatches(input, ingredient.name, ingredient.matchConfig.partials);
      if (partialMatch.matched) {
        matches.push({
          name: input,
          normalized: input,
          details: ingredient,
          categories: ingredient.category,
          matchDetails: {
            matched: true,
            matchTypes: ['partialMatch'],
            searchType: 'ingredient',
            confidence: 0.7,
            matchedOn: partialMatch.matchedOn ? [partialMatch.matchedOn] : undefined
          }
        });
      }
    }
  }

  // Then try to match against categories
  for (const [groupName, group] of Object.entries(database.categories)) {
    for (const [catName, category] of Object.entries(group.categories)) {
      if (category.matchConfig) {
        // Try exact category matches
        if (input.toLowerCase() === catName.toLowerCase()) {
          matches.push({
            name: input,
            normalized: input,
            categories: [catName],
            matchDetails: {
              matched: true,
              matchTypes: ['exactMatch'],
              searchType: 'category',
              confidence: 0.8,
              matchedOn: [catName]
            }
          });
        }

        // Try partial category matches
        if (category.matchConfig.partials) {
          const partialMatch = findPartialMatches(input, catName, category.matchConfig.partials);
          if (partialMatch.matched) {
            matches.push({
              name: input,
              normalized: input,
              categories: [catName],
              matchDetails: {
                matched: true,
                matchTypes: ['partialMatch'],
                searchType: 'category',
                confidence: 0.6,
                matchedOn: partialMatch.matchedOn ? [partialMatch.matchedOn] : undefined
              }
            });
          }
        }
      }
    }

    // Try category group matches
    if (group.matchConfig) {
      const groupMatch = findPartialMatches(input, group.name, group.matchConfig.partials);
      if (groupMatch.matched) {
        matches.push({
          name: input,
          normalized: input,
          categories: Object.keys(group.categories),
          matchDetails: {
            matched: true,
            matchTypes: ['partialMatch'],
            searchType: 'categoryGroup',
            confidence: 0.5,
            matchedOn: [group.name]
          }
        });
      }
    }
  }

  // Sort matches by confidence
  matches.sort((a, b) =>
    (b.matchDetails?.confidence || 0) - (a.matchDetails?.confidence || 0)
  );

  // If no matches found, return basic info
  return matches.length > 0 ? matches : [{
    name: input,
    normalized: input
  }];
}
