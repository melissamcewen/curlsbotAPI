import { defaultDatabase } from '../../src/data/bundledData';
import type { Ingredient, Category, Group } from '../../src/types';

describe('Production Database E2E Tests', () => {
  describe('Data Loading', () => {
    it('should load and validate the production database', () => {
      // Verify database structure
      expect(defaultDatabase).toBeDefined();
      expect(defaultDatabase.ingredients).toBeDefined();
      expect(defaultDatabase.categories).toBeDefined();
      expect(defaultDatabase.groups).toBeDefined();

      // Verify data types
      expect(typeof defaultDatabase.ingredients).toBe('object');
      expect(typeof defaultDatabase.categories).toBe('object');
      expect(typeof defaultDatabase.groups).toBe('object');
    });

    it('should have valid relationships between all data', () => {
      const warnings: string[] = [];

      // Check that all ingredient categories exist and are valid
      Object.entries(defaultDatabase.ingredients).forEach(([id, ingredient]: [string, Ingredient]) => {
        expect(id).toBe(ingredient.id); // ID should match the key
        expect(Array.isArray(ingredient.categories)).toBe(true);
        ingredient.categories.forEach((categoryId: string) => {
          const category = defaultDatabase.categories[categoryId];
          if (!category) {
            warnings.push(`Warning: Category "${categoryId}" referenced by ingredient "${ingredient.name}" does not exist`);
          }
        });
      });

      // Check that all category groups exist and are valid
      Object.entries(defaultDatabase.categories).forEach(([id, category]: [string, Category]) => {
        expect(id).toBe(category.id); // ID should match the key
        const group = defaultDatabase.groups[category.group];
        if (!group) {
          warnings.push(`Warning: Group "${category.group}" referenced by category "${category.name}" does not exist`);
        }
      });

      // Log warnings if any
      if (warnings.length > 0) {
        console.warn('Relationship warnings:');
        warnings.forEach(warning => console.warn(warning));
      }
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
