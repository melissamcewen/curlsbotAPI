import { NormalizedIngredientList } from '../types';
/**
 * Checks if an individual ingredient is valid
 * @param value - The ingredient string to validate
 * @returns `true` if ingredient is valid, `false` otherwise
 */
export declare function isValidIngredient(value: string): boolean;
/**
 * Checks if the input string is a valid ingredients list
 * @param value - The ingredient list string to validate
 * @returns `true` if list is valid, `false` if it contains URLs or is empty
 */
export declare function isValidIngredientList(value: string): boolean;
/**
 * Normalizes an ingredient name for comparison
 */
export declare function normalizeIngredient(name: string): string;
/**
 * Looks for comma seperated ingredient lists in parentheses and extracts them,
 * returns a single string with the combined ingredient list from the parentheses so we can add it to the main list
 * @param ingredient_list - The ingredient string to process
 * @returns Original string with any comma seperated lists in parentheses removed and added to the end of the string
 */
export declare function processCommaParentheses(ingredient_list: string): string;
/**
 * Splits a string by commas, line breaks, pipes, ampersands, and the word "and", then cleans the resulting array
 * @param text - The text to split
 * @returns Array of cleaned strings
 */
export declare function splitBySeparators(text: string): string[];
/**
 * Normalizes a cosmetic ingredients list string
 */
export declare function normalizer(text: string): NormalizedIngredientList;
//# sourceMappingURL=normalizer.d.ts.map