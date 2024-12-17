import type { IngredientDatabase } from '../../src/types';
import { readFileSync, writeFileSync } from 'fs';

function isAcronym(word: string): boolean {
  // List of known acronyms that should stay uppercase
  const acronyms = ['PEG', 'PPG', 'SD'];
  return acronyms.includes(word.toUpperCase());
}

function validateNameCase(name: string): boolean {
  // Each word should be capitalized, including after hyphens
  const words = name.split(/[\s-]/);
  return words.every((word) => {
    if (!word) return true;
    if (isAcronym(word)) return word === word.toUpperCase();
    return (
      word[0] === word[0].toUpperCase() &&
      word.slice(1) === word.slice(1).toLowerCase()
    );
  });
}

export function validateCaseFormatting(database: IngredientDatabase): string[] {
  const errors: string[] = [];

  Object.values(database.ingredients).forEach((ingredient) => {
    // Check ingredient name case
    if (!validateNameCase(ingredient.name)) {
      errors.push(
        `❌ Invalid name case: "${ingredient.name}" should be like "Cetearyl Alcohol"`,
      );
    }

    // Check synonym case
    if (ingredient.synonyms) {
      ingredient.synonyms.forEach((synonym) => {
        if (synonym !== synonym.toLowerCase()) {
          errors.push(
            `❌ Invalid synonym case: "${synonym}" in "${ingredient.name}" should be lowercase`,
          );
        }
      });
    }
  });

  return errors;
}

export function fixIngredientCase(ingredientsFile: string): boolean {
  const data = JSON.parse(readFileSync(ingredientsFile, 'utf-8'));
  let hasChanges = false;

  data.ingredients = data.ingredients.map(
    (ingredient: { name: string; synonyms?: string[] }) => {
      // Fix ingredient name while preserving hyphens and acronyms
      const fixedName = ingredient.name
        .split(/(?<=[-\s])|(?=[-\s])/) // Split but keep delimiters
        .map((part) => {
          if (part === '-' || part === ' ') return part;
          if (isAcronym(part)) return part.toUpperCase();
          return part[0].toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('');

      if (fixedName !== ingredient.name) {
        console.log(
          `✨ Fixed name case: "${ingredient.name}" -> "${fixedName}"`,
        );
        ingredient.name = fixedName;
        hasChanges = true;
      }

      // Fix synonyms
      if (ingredient.synonyms) {
        const originalSynonyms = [...ingredient.synonyms];
        ingredient.synonyms = ingredient.synonyms.map((synonym) =>
          synonym.toLowerCase(),
        );

        if (
          JSON.stringify(originalSynonyms) !==
          JSON.stringify(ingredient.synonyms)
        ) {
          console.log(`✨ Fixed synonym case in "${ingredient.name}"`);
          hasChanges = true;
        }
      }

      return ingredient;
    },
  );

  if (hasChanges) {
    writeFileSync(ingredientsFile, JSON.stringify(data, null, 2) + '\n');
  }

  return hasChanges;
}
