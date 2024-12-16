import type { NormalizedIngredientList } from '../types';

/**
 * Checks if an individual ingredient is valid
 * @param value - The ingredient string to validate
 * @returns `true` if ingredient is valid, `false` otherwise
 */
export function isValidIngredient(value: string): boolean {
  return value.trim().length > 0 && value.length <= 150;
}

/**
 * Checks if the input string is a valid ingredients list
 * @param value - The ingredient list string to validate
 * @returns `true` if list is valid, `false` if it contains URLs or is empty
 */
export function isValidIngredientList(value: string): boolean {
  // Check for URLs
  if (/^(?:https?:\/\/|www\.|\/{2})/i.test(value)) {
    return false;
  }
  return value.trim().length > 0;
}


/**
 * Normalizes an ingredient name for comparison
 */
export function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, ' ') // Replace parentheses with spaces
    .replace(/[^a-z0-9\s\-]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}


/**
 * Looks for comma seperated ingredient lists in parentheses and extracts them,
 * returns a single string with the combined ingredient list from the parentheses so we can add it to the main list
 * @param ingredient_list - The ingredient string to process
 * @returns Original string with any comma seperated lists in parentheses removed and added to the end of the string
 */
export function processCommaParentheses(ingredient_list: string): string {
  const matches = ingredient_list.match(/\(([^)]*,.*?)\)/g);

  if (!matches) {
    return ingredient_list;
  }

  const cleanedString = matches
    .reduce((str, match) => str.replace(match, ''), ingredient_list)
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ') // Normalize spaces around commas
    .trim();

  const extractedContent = matches
    .map(match => match.slice(1, -1))
    .join(', ');

  return [cleanedString, extractedContent]
    .filter(Boolean)
    .join(', ');
}

/**
 * Splits a string by commas, line breaks, pipes, ampersands, and the word "and", then cleans the resulting array
 * @param text - The text to split
 * @returns Array of cleaned strings
 */
export function splitBySeparators(text: string): string[] {
  return text
    .split(/(?:[,\n\r|&]|\s+and\s+)/) // Split by comma, newline, carriage return, pipe, ampersand, or " and "
    .map(part => part.trim())
    .filter(Boolean); // Remove empty strings
}



/**
 * Normalizes a cosmetic ingredients list string
 */
export function normalizer(text: string): NormalizedIngredientList {
  if (!isValidIngredientList(text)) {
    return { ingredients: [], isValid: false };
  }
  // first process the text to remove any commas in parentheses
  const processedText = processCommaParentheses(text);
  // then split the text by commas
  const ingredients = splitBySeparators(processedText);

  //remove any invalid ingredients
  const validIngredients = ingredients.filter(isValidIngredient);

  // then process each ingredient to remove any invalid characters and trim
  const normalizedIngredients = validIngredients.map(ingredient => normalizeIngredient(ingredient));

  return { ingredients: normalizedIngredients, isValid: true };
}

