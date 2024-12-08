/**
 * Checks if the input string is a valid ingredients list
 * Returns false if the string contains URLs or is too long
 */
function isValidIngredientList(value: string): boolean {
  // Check for URLs
  if (/^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(value)) {
    return false;
  }
  // Check length
  return value.length <= 150;
}

/**
 * Normalizes a cosmetic ingredients list string into an array of clean ingredient names
 * Returns an empty array if the input is invalid
 */
export function normalizer(text: string): string[] {
  // First check if the input is valid
  if (!isValidIngredientList(text)) {
    return [];
  }

  // Regular expressions for cleaning the text
  const parentheses = / *\([^)]*\) */g;  // Matches content within parentheses
  const forbidden = /[^0-9A-Za-z\s+-]/g;  // Matches non-alphanumeric chars except spaces and hyphens
  const and = /\band\b/ig;                // Matches the word "and"
  const sepChar = /[|&]/ig;               // Matches separator characters
  const lineBreaks = /\r?\n|\r/g;         // Matches all types of line breaks
  const excessSpaces = /\s\s+/g;          // Matches multiple spaces

  // Split the text into individual ingredients
  const ingredientsList = text
    .replace(lineBreaks, ' ')
    .replace(excessSpaces, ' ')
    .replace(and, ',')
    .replace(sepChar, ',')
    .split(',');

  // Process each ingredient
  return ingredientsList
    .map(x => x
      .trim()
      .toLowerCase()
      .replace(parentheses, ' ')    // Remove parenthetical content
      .replace(forbidden, '')       // Remove forbidden characters
      .replace(/\s+/g, ' ')        // Normalize spaces
      .trim()
    )
    .filter(x => x.length > 0);    // Remove empty strings
}
