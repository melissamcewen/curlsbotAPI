import type { IngredientDatabase } from '../../src/types';
import { readFileSync, writeFileSync } from 'fs';

export function validateDuplicates(database: IngredientDatabase): string[] {
  const errors: string[] = [];
  const ingredients = Object.values(database.ingredients);

  // Track names and synonyms for case-insensitive comparison
  const names = new Map<string, string>(); // lowercase name -> original name
  const synonyms = new Map<string, { name: string; synonym: string }>(); // lowercase synonym -> {ingredient name, original synonym}

  ingredients.forEach((ingredient) => {
    // Check for duplicate names
    const lowerName = ingredient.name.toLowerCase();
    if (names.has(lowerName)) {
      errors.push(
        `❌ Duplicate ingredient name: "${ingredient.name}" matches "${names.get(lowerName)}"`,
      );
    } else {
      names.set(lowerName, ingredient.name);
    }

    // Check for duplicate synonyms
    if (ingredient.synonyms) {
      ingredient.synonyms.forEach((synonym) => {
        const lowerSynonym = synonym.toLowerCase();
        if (synonyms.has(lowerSynonym)) {
          const existing = synonyms.get(lowerSynonym);
          if (existing) {
            errors.push(
              `❌ Duplicate synonym: "${synonym}" used by both "${ingredient.name}" and "${existing.name}"`,
            );
          }
        } else {
          synonyms.set(lowerSynonym, { name: ingredient.name, synonym });
        }

        // Check if synonym matches any ingredient name
        if (names.has(lowerSynonym)) {
          errors.push(
            `❌ Synonym "${synonym}" of "${ingredient.name}" matches ingredient name "${names.get(lowerSynonym)}"`,
          );
        }
      });
    }
  });

  return errors;
}

export function cleanRedundantSynonyms(ingredientsFile: string): boolean {
  const data = JSON.parse(readFileSync(ingredientsFile, 'utf-8'));
  let hasChanges = false;

  data.ingredients = data.ingredients.map(
    (ingredient: { name: string; synonyms?: string[] }) => {
      if (!ingredient.synonyms) return ingredient;

      const nameLower = ingredient.name.toLowerCase();
      const originalLength = ingredient.synonyms.length;

      ingredient.synonyms = ingredient.synonyms.filter(
        (synonym: string) => synonym.toLowerCase() !== nameLower,
      );

      if (ingredient.synonyms.length !== originalLength) {
        console.log(`✨ Removed redundant synonym from "${ingredient.name}"`);
        hasChanges = true;
      }

      // Remove the synonyms array if it's empty
      if (ingredient.synonyms.length === 0) {
        delete ingredient.synonyms;
      }

      return ingredient;
    },
  );

  if (hasChanges) {
    writeFileSync(ingredientsFile, JSON.stringify(data, null, 2) + '\n');
  }

  return hasChanges;
}
