import type { NormalizedIngredientList } from '../types';

/**
 * Checks if an individual ingredient is valid
 * @param value - The ingredient string to validate
 * @returns `true` if ingredient is valid, `false` otherwise
 */
export function isValidIngredient(value: string): boolean {
  const normalized = value.trim();
  // Check if after normalization we actually have alphanumeric content
  return normalized.length > 0 &&
         normalized.length <= 150 &&
         /[a-zA-Z0-9]/.test(normalized); // Must contain at least one alphanumeric character
}

/**
 * Checks if the input string is a valid ingredients list
 * @param value - The ingredient list string to validate
 * @returns `true` if list is valid, `false` if it contains URLs or is empty
 */
export function isValidIngredientList(value: string): boolean {
  // Check for strings shorter than 2 characters
  if (value.length < 2) {
    return false;
  }

  // Check for URLs
  if (/(?:https?:\/\/|www\.|\/{2})/i.test(value)) {
    return false;
  }
  // Check for product names
  const productNames = /(shampoo|conditioner)/i; // Add more product names as needed
  if (productNames.test(value)) {
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
    .replace(/\//g, ' ') // Replace slashes with spaces
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
  const regex = /\(([^()]*?)\)/g; // Match non-nested parentheses
  let result = ingredient_list;

  let hasChanges = true;

  // Process parentheses content iteratively to handle nested structures
  while (hasChanges) {
    hasChanges = false;
    result = result.replace(regex, (_, content) => {
      const trimmedContent = content.trim();

      if (trimmedContent.includes(',')) {
        hasChanges = true;
        // Replace content with comma-separated items inside parentheses
        return `, ${trimmedContent
          .split(',')
          .map((c: string) => c.trim())
          .join(', ')}`;
      }

      if (trimmedContent === '') {
        return ''; // Remove empty parentheses completely instead of preserving them
      }

      return `(${content})`; // Return parentheses content unchanged
    });
  }

  // Final cleanup for inner spaces **only inside parentheses**
  result = result.replace(/,\s*,/g, ','); // Remove unnecessary commas inside
  result = result.replace(/,(\s*\))/g, '$1'); // Remove commas before closing parentheses

  return result;
}






/**
 * Splits a string by commas, line breaks, pipes, ampersands, and the word "and", then cleans the resulting array
 * @param text - The text to split
 * @returns Array of cleaned strings
 */
export function splitBySeparators(text: string): string[] {
  return text
    .split(/(?:[,|&]|\s+and\s+)/) // Split by comma, pipe, ampersand, or " and "
    .map(part => part.trim())
    .filter(part => part.length > 0); // Change Boolean to explicit length check
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

  // Return invalid if no valid ingredients were found
  if (validIngredients.length === 0) {
    return { ingredients: [], isValid: false };
  }

  // then process each ingredient to remove any invalid characters and trim
  const normalizedIngredients = validIngredients.map(ingredient => normalizeIngredient(ingredient));

  return { ingredients: normalizedIngredients, isValid: true };
}

