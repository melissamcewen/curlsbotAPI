import { describe, it, expect } from 'vitest';
import { testDatabase } from '../fixtures/testDatabase';

describe('Database Validation', () => {
  describe('Name Formatting', () => {
    // Helper function to check if string is in Title Case with special handling for hyphens
    function isTitleCase(str: string): boolean {
      // Split into words, handling hyphens specially
      const words = str.split(' ').map(word => {
        if (word.includes('-')) {
          // For hyphenated words, only first part should be capitalized
          const parts = word.split('-');
          return parts[0].charAt(0) === parts[0].charAt(0).toUpperCase() &&
                 parts.slice(1).every(part => part.charAt(0) === part.charAt(0).toLowerCase());
        }
        return word.charAt(0) === word.charAt(0).toUpperCase();
      });

      return words.every(result => result === true);
    }

    it('all category names should be in correct Title Case (hyphenated words have subsequent parts in lower case)', () => {
      Object.values(testDatabase.categories).forEach(category => {
        expect(isTitleCase(category.name),
          `Category "${category.name}" is not in correct case. ` +
          'First word and words after spaces should be capitalized, ' +
          'but words after hyphens should be lowercase.'
        ).toBe(true);
      });
    });

    it('all ingredient names should be in Title Case', () => {
      Object.values(testDatabase.ingredients).forEach(ingredient => {
        expect(isTitleCase(ingredient.name),
          `Ingredient "${ingredient.name}" is not in correct case. ` +
          'First word and words after spaces should be capitalized, ' +
          'but words after hyphens should be lowercase.'
        ).toBe(true);
      });
    });
  });

  describe('ID Generation and Uniqueness', () => {
    // Helper function to generate ID from name
    function generateId(name: string): string {
      return name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '-');
    }

    it('should not have duplicate ingredient names', () => {
      const allIngredients = new Set<string>();

      Object.values(testDatabase.ingredients).forEach(ingredient => {
        const normalizedName = ingredient.name.toLowerCase();
        expect(allIngredients.has(normalizedName),
          `Duplicate ingredient name found: "${ingredient.name}"`
        ).toBe(false);

        allIngredients.add(normalizedName);
      });
    });

    it('should not have duplicate IDs for category groups, categories, and ingredients, and IDs should be in correct format', () => {
      const allIds = new Set<string>();

      // Check group IDs
      Object.entries(testDatabase.groups).forEach(([id, group]) => {
        const expectedId = generateId(group.name);
        expect(id).toBe(expectedId);
        expect(allIds.has(id),
          `Duplicate group ID found: "${id}"`
        ).toBe(false);
        allIds.add(id);
      });

      // Check category IDs
      Object.entries(testDatabase.categories).forEach(([id, category]) => {
        const expectedId = generateId(category.name);
        expect(id).toBe(expectedId);
        expect(allIds.has(id),
          `Duplicate category ID found: "${id}"`
        ).toBe(false);
        allIds.add(id);
      });

      // Check ingredient IDs
      Object.entries(testDatabase.ingredients).forEach(([id, ingredient]) => {
        const expectedId = generateId(ingredient.name);
        expect(id).toBe(expectedId);
        expect(allIds.has(id),
          `Duplicate ingredient ID found: "${id}"`
        ).toBe(false);
        allIds.add(id);
      });
    });
  });

  describe('Category Relationships', () => {
    it('all ingredients should belong to valid categories', () => {
      // Get all valid category IDs
      const validCategoryIds = new Set(Object.keys(testDatabase.categories));

      Object.values(testDatabase.ingredients).forEach(ingredient => {
        ingredient.categories.forEach(catId => {
          expect(validCategoryIds.has(catId),
            `Invalid category ID "${catId}" found in ingredient "${ingredient.name}". ` +
            `Valid category IDs are: ${Array.from(validCategoryIds).join(', ')}`
          ).toBe(true);
        });
      });
    });
  });
});
