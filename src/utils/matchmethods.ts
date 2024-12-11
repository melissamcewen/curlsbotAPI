import Fuse from 'fuse.js';

import { Ingredient } from '../types';

/**
 * Checks if two strings match exactly (case-insensitive)
 */
function exactMatch(input: string, target: string): boolean {
  return input.toLowerCase() === target.toLowerCase();
}

/**
 * Tries to find an exact match with the ingredient name or its synonyms
 */
function findExactMatch(
  input: string,
  targetName: string,
  synonyms?: string[],
): { matched: boolean; matchedOn?: string[] } {
  const matches: string[] = [];

  // Check base name
  if (exactMatch(input, targetName)) {
    matches.push(targetName);
  }

  // Check synonyms
  if (synonyms?.length) {
    const matchedSynonyms = synonyms.filter((syn) => exactMatch(input, syn));
    matches.push(...matchedSynonyms);
  }

  return {
    matched: matches.length > 0,
    matchedOn: matches.length > 0 ? matches : undefined,
  };
}

/**
 * Checks if input partially matches target or any configured partial matches
 */
function findPartialMatches(
  input: string,
  targetName: string,
  partials?: string[],
): { matched: boolean; matchedOn?: string } {
  const normalizedInput = input.toLowerCase();

  // Check if input contains the target name
  if (normalizedInput.includes(targetName.toLowerCase())) {
    return { matched: true, matchedOn: targetName };
  }

  // Check configured partial matches
  if (partials?.length) {
    for (const partial of partials) {
      if (normalizedInput.includes(partial.toLowerCase())) {
        return { matched: true, matchedOn: partial };
      }
    }
  }

  return { matched: false };
}

/**
 * Checks if input matches any regex patterns
 */
function regexMatch(input: string, patterns?: string[]): boolean {
  if (!patterns?.length) return false;
  return patterns.some((pattern) => {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(input);
    } catch {
      return false;
    }
  });
}

/**
 * Checks if input fuzzy matches target
 */
const fuseOptions = {
  threshold: 0.3,
  keys: ['name'],
};

/**
 * Checks if input fuzzy matches target
 */
function fuzzyMatch(
  input: string,
  ingredients: Ingredient[],
): { matchedOn: string; ingredient: Ingredient }[] {
  // Filter to only ingredients with fuzzyMatch enabled
  const fuzzyCorpus = ingredients.filter((ing) =>
    ing.matchConfig?.matchType?.includes('fuzzyMatch'),
  );

  const fuse = new Fuse(fuzzyCorpus, {
    keys: ['name', 'synonyms'],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
  });

  type FuseResult = Fuse.FuseResult<Ingredient> & {
    matches: Array<{ value: string }>;
  };

  const results = fuse.search(input) as FuseResult[];
  return results
    .filter((result) => result.score && result.score < 0.4)
    .map((result) => {
      const matchedField = result.matches[0];
      return {
        ingredient: result.item,
        matchedOn: matchedField.value as string,
      };
    });
}
export { findExactMatch, findPartialMatches, regexMatch, fuzzyMatch };
