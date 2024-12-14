import { join } from 'path';
import fs from 'fs';

import { loadIngredients, loadCategories, loadGroups } from '../../src/utils/dataLoader';

const TEST_DATA_DIR = join(__dirname, '../fixtures/data');
const TEST_SCHEMA_DIR = join(__dirname, '../../src/data/schema');

describe('Data Loader Unit Tests', () => {
  describe('Individual Loaders', () => {
    it('should load ingredients separately', () => {
      const ingredients = loadIngredients({
        dataDir: TEST_DATA_DIR,
        schemaDir: TEST_SCHEMA_DIR
      });
      expect(Object.keys(ingredients)).toHaveLength(2);
      expect(ingredients.cetyl_alcohol.name).toBe('Cetyl Alcohol');
      expect(ingredients.cetyl_alcohol.categories).toContain('emollient_alcohol');
      expect(ingredients.sd_alcohol.name).toBe('SD Alcohol');
      expect(ingredients.sd_alcohol.categories).toContain('drying_alcohol');
    });

    it('should load categories separately', () => {
      const categories = loadCategories({
        dataDir: TEST_DATA_DIR,
        schemaDir: TEST_SCHEMA_DIR
      });
      expect(Object.keys(categories)).toHaveLength(2);
      expect(categories.emollient_alcohol.group).toBe('alcohols');
      expect(categories.drying_alcohol.group).toBe('alcohols');
    });

    it('should load groups separately', () => {
      const groups = loadGroups({
        dataDir: TEST_DATA_DIR,
        schemaDir: TEST_SCHEMA_DIR
      });
      expect(Object.keys(groups)).toHaveLength(1);
      expect(groups.alcohols.description).toBe('Different types of alcohols used in hair care');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid ingredient data', () => {
      const invalidData = {
        ingredients: [{
          // Missing required 'name' field
          id: 'test',
          categories: []
        }]
      };

      // Write invalid data to a temporary file
      const tempDir = join(TEST_DATA_DIR, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const tempFile = join(tempDir, 'ingredients.json');
      fs.writeFileSync(tempFile, JSON.stringify(invalidData));

      expect(() => {
        loadIngredients({
          dataDir: tempDir,
          schemaDir: TEST_SCHEMA_DIR
        });
      }).toThrow();

      // Clean up
      fs.unlinkSync(tempFile);
      fs.rmdirSync(tempDir);
    });

    it('should throw error for missing files', () => {
      expect(() => {
        loadIngredients({
          dataDir: 'nonexistent',
          schemaDir: TEST_SCHEMA_DIR
        });
      }).toThrow();
    });

    it('should throw error for invalid schema path', () => {
      expect(() => {
        loadIngredients({
          dataDir: TEST_DATA_DIR,
          schemaDir: 'nonexistent'
        });
      }).toThrow();
    });
  });
});
