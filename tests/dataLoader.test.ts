import { join } from 'path';

import { loadDatabase, loadIngredients, loadCategories, loadGroups } from '../src/utils/dataLoader';

const TEST_DATA_DIR = join(__dirname, 'fixtures/data');

describe('Data Loader', () => {
  describe('loadDatabase', () => {
    it('should load and validate the entire database', () => {
      const database = loadDatabase(TEST_DATA_DIR);

      // Check ingredients
      expect(Object.keys(database.ingredients)).toHaveLength(2);
      expect(database.ingredients.cetyl_alcohol.name).toBe('Cetyl Alcohol');
      expect(database.ingredients.sd_alcohol.name).toBe('SD Alcohol');

      // Check categories
      expect(Object.keys(database.categories)).toHaveLength(2);
      expect(database.categories.emollient_alcohol.name).toBe('Emollient Alcohols');
      expect(database.categories.drying_alcohol.name).toBe('Drying Alcohols');

      // Check groups
      expect(Object.keys(database.groups)).toHaveLength(1);
      expect(database.groups.alcohols.name).toBe('Alcohols');
    });
  });

  describe('Individual Loaders', () => {
    it('should load ingredients separately', () => {
      const ingredients = loadIngredients(TEST_DATA_DIR);
      expect(Object.keys(ingredients)).toHaveLength(2);
      expect(ingredients.cetyl_alcohol.name).toBe('Cetyl Alcohol');
      expect(ingredients.cetyl_alcohol.categories).toContain('emollient_alcohol');
      expect(ingredients.sd_alcohol.name).toBe('SD Alcohol');
      expect(ingredients.sd_alcohol.categories).toContain('drying_alcohol');
    });

    it('should load categories separately', () => {
      const categories = loadCategories(TEST_DATA_DIR);
      expect(Object.keys(categories)).toHaveLength(2);
      expect(categories.emollient_alcohol.group).toBe('alcohols');
      expect(categories.drying_alcohol.group).toBe('alcohols');
    });

    it('should load groups separately', () => {
      const groups = loadGroups(TEST_DATA_DIR);
      expect(Object.keys(groups)).toHaveLength(1);
      expect(groups.alcohols.description).toBe('Different types of alcohols used in hair care');
    });
  });

  describe('Error Handling', () => {
    // We'll test error cases by temporarily modifying test data files
    it('should throw error for invalid ingredient data', () => {
      const invalidData = {
        ingredients: [{
          // Missing required 'name' field
          id: 'test',
          categories: []
        }]
      };

      // Write invalid data to a temporary file
      const fs = require('fs');
      const tempFile = join(TEST_DATA_DIR, 'temp_ingredients.json');
      fs.writeFileSync(tempFile, JSON.stringify(invalidData));

      expect(() => {
        const schema = loadSchema(join(TEST_DATA_DIR, 'schema/ingredients.schema.json'));
        loadAndValidateJson(tempFile, schema);
      }).toThrow();

      // Clean up
      fs.unlinkSync(tempFile);
    });
  });
});
