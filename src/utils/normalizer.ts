import type { NormalizedIngredientList } from '@/types';

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
  const parentheses = / *\([^)]*\) */g;
  const forbidden = /[^0-9A-Za-z\s+-]/g;
  const and = /\band\b/ig;
  const sepChar = /[|&,]/ig;
  const lineBreaks = /\r?\n|\r/g;
  const excessSpaces = /\s\s+/g;

  // Split and clean ingredients
  const ingredients = text
    .replace(lineBreaks, ' ')
    .replace(excessSpaces, ' ')
    .replace(and, ',')
    .replace(sepChar, ',')
    .split(',')
    .map(x => x
      .trim()
      .toLowerCase()
      .replace(parentheses, ' ')
      .replace(forbidden, '')
      .replace(/\s+/g, ' ')
      .trim()
    )
    .filter(isValidIngredient);    // Filter out invalid ingredients

  return {
    ingredients: Object.freeze(ingredients),
    isValid: ingredients.length > 0
  };
}
