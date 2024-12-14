import { join } from 'path';
import { loadDatabase } from '../../src/utils/dataLoader';
import { getDefaultDatabase } from '../../src/data/defaultDatabase';

describe('Production Database E2E Tests', () => {
  describe('Data Loading', () => {
    it('should load and validate the production database', () => {
      const database = getDefaultDatabase();

      // Verify database structure
      expect(database).toBeDefined();
      expect(database.ingredients).toBeDefined();
      expect(database.categories).toBeDefined();
      expect(database.groups).toBeDefined();
    });

    it('should have valid relationships between all data', () => {
      const database = getDefaultDatabase();

      // Check that all ingredient categories exist
      Object.values(database.ingredients).forEach(ingredient => {
        ingredient.categories.forEach(categoryId => {
          expect(database.categories[categoryId]).toBeDefined();
        });
      });

      // Check that all category groups exist
      Object.values(database.categories).forEach(category => {
        expect(database.groups[category.group]).toBeDefined();
      });
    });

    it('should have required fields for all data', () => {
      const database = getDefaultDatabase();

      // Check ingredients
      Object.values(database.ingredients).forEach(ingredient => {
        expect(ingredient.id).toBeDefined();
        expect(ingredient.name).toBeDefined();
        expect(Array.isArray(ingredient.categories)).toBe(true);
      });

      // Check categories
      Object.values(database.categories).forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.group).toBeDefined();
      });

      // Check groups
      Object.values(database.groups).forEach(group => {
        expect(group.id).toBeDefined();
        expect(group.name).toBeDefined();
        expect(group.description).toBeDefined();
      });
    });
  });
});
