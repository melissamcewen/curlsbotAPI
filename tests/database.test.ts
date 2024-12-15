import { defaultDatabase } from '../src/data/bundledData';
import type { Ingredient, Category, Group } from '../src/types';

describe('Production Database E2E Tests', () => {
  describe('Data Loading', () => {
    it('should load and validate the production database', () => {
      // Verify database structure
      expect(defaultDatabase).toBeDefined();
      expect(defaultDatabase.ingredients).toBeDefined();
      expect(defaultDatabase.categories).toBeDefined();
      expect(defaultDatabase.groups).toBeDefined();
    });

    it('should have valid relationships between all data', () => {
      // Check that all ingredient categories exist
      Object.values(defaultDatabase.ingredients).forEach((ingredient: Ingredient) => {
        ingredient.categories.forEach((categoryId: string) => {
          expect(defaultDatabase.categories[categoryId]).toBeDefined();
        });
      });

      // Check that all category groups exist
      Object.values(defaultDatabase.categories).forEach((category: Category) => {
        expect(defaultDatabase.groups[category.group]).toBeDefined();
      });
    });

    it('should have required fields for all data', () => {
      // Check ingredients
      Object.values(defaultDatabase.ingredients).forEach((ingredient: Ingredient) => {
        expect(ingredient.id).toBeDefined();
        expect(ingredient.name).toBeDefined();
        expect(Array.isArray(ingredient.categories)).toBe(true);
      });

      // Check categories
      Object.values(defaultDatabase.categories).forEach((category: Category) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.group).toBeDefined();
      });

      // Check groups
      Object.values(defaultDatabase.groups).forEach((group: Group) => {
        expect(group.id).toBeDefined();
        expect(group.name).toBeDefined();
        // Description is optional for groups
      });
    });
  });
});
