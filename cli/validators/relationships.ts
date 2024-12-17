import type { IngredientDatabase } from '../../src/types';

export function validateRelationships(database: IngredientDatabase): string[] {
  const errors: string[] = [];

  // Check that all ingredient categories exist
  Object.values(database.ingredients).forEach((ingredient) => {
    ingredient.categories.forEach((categoryId) => {
      if (!database.categories[categoryId]) {
        errors.push(
          `❌ Invalid category "${categoryId}" referenced by ingredient "${ingredient.name}"`,
        );
      }
    });
  });

  // Check that no ingredients use group IDs as categories
  const groupIds = Object.keys(database.groups);
  Object.values(database.ingredients).forEach((ingredient) => {
    ingredient.categories.forEach((categoryId) => {
      if (groupIds.includes(categoryId)) {
        errors.push(
          `❌ Group "${categoryId}" used as category in ingredient "${ingredient.name}"`,
        );
      }
    });
  });

  // Check that all category groups exist
  Object.values(database.categories).forEach((category) => {
    if (!database.groups[category.group]) {
      errors.push(
        `❌ Invalid group "${category.group}" referenced by category "${category.name}"`,
      );
    }
  });

  return errors;
}
