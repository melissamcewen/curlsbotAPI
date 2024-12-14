import type { NormalizedIngredientList } from '../types';

/**
 * Checks if an individual ingredient is valid
 * @param value - The ingredient string to validate
 * @returns `true` if ingredient is valid, `false` otherwise
 */
function isValidIngredient(value: string): boolean {
  return value.trim().length > 0 && value.length <= 150;
}

/**
 * Checks if the input string is a valid ingredients list
 * @param value - The ingredient list string to validate
 * @returns `true` if list is valid, `false` if it contains URLs or is empty
 */
function isValidIngredientList(value: string): boolean {
  // Check for URLs
  if (/^(?:https?:\/\/|www\.|\/{2})/i.test(value)) {
    return false;
  }
  return value.trim().length > 0;
}

/**
 * Normalizes an ingredient name for comparison
 */
export function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
    .trim();
}

/**
 * Extracts both the main ingredient name and any parenthetical content
 * @param ingredient - The ingredient string to process
 * @returns Array of normalized ingredient names
 */
function extractIngredientVariants(ingredient: string): string[] {
  const variants = new Set<string>();

  // Extract base name (without parentheses)
  const withoutParentheses = ingredient
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .trim()
    .toLowerCase();
  variants.add(withoutParentheses);

  // Extract content from parentheses if it contains "alcohol" or "denat"
  const parentheticalMatches = ingredient.match(/\((.*?)\)/g);
  if (parentheticalMatches) {
    parentheticalMatches.forEach((match) => {
      const content = match.slice(1, -1).trim().toLowerCase();
      if (content.includes('alcohol') || content.includes('denat')) {
        variants.add(content);
      }
    });
  }

  return Array.from(variants);
}

/**
 * Normalizes a cosmetic ingredients list string into a validated structure
 * @param text - Raw ingredient list text
 * @returns Normalized and validated ingredient list structure
 * @throws Never throws
 */
export function normalizer(text: string): NormalizedIngredientList {
  if (!isValidIngredientList(text)) {
    return { ingredients: [], isValid: false };
  }

  // Regular expressions for cleaning the text
  const lineBreaks = /\r?\n|\r/g;
  const excessSpaces = /\s\s+/g;
  const and = /\band\b/gi;
  const sepChar = /[|&,]/gi;

  // Split and clean ingredients
  const ingredients = text
    .replace(lineBreaks, ',')
    .replace(excessSpaces, ' ')
    .replace(and, ',')
    .replace(sepChar, ',')
    .split(',')
    .flatMap((x) => {
      const trimmed = x.trim();
      return isValidIngredient(trimmed)
        ? extractIngredientVariants(trimmed)
        : [];
    });

  // Remove duplicates based on normalized comparison
  const seen = new Set<string>();
  const uniqueIngredients = ingredients.filter((ingredient) => {
    const normalized = normalizeForComparison(ingredient);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });

  return {
    ingredients: Object.freeze(uniqueIngredients),
    isValid: uniqueIngredients.length > 0,
  };
}
