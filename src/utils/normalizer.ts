/**
 * Represents a normalized ingredient list that has been validated and cleaned
 */
export interface NormalizedIngredientList {
  readonly ingredients: readonly string[];
  readonly isValid: boolean;
}

/**
 * Checks if an individual ingredient is valid
 * Returns false if longer than 150 chars
 */
function isValidIngredient(value: string): boolean {
  return value.trim().length > 0 && value.length <= 150;
}

/**
 * Checks if the input string is a valid ingredients list
 * Returns false if the string contains URLs
 */
function isValidIngredientList(value: string): boolean {
  // Check for URLs
  if (/^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(value)) {
    return false;
  }
  return value.trim().length > 0;
}

/**
 * Normalizes a cosmetic ingredients list string into a validated structure
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
