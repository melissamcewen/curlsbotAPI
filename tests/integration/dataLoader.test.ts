import { join } from 'path';

import { loadDatabase } from '../../src/utils/dataLoader';

const TEST_DATA_DIR = join(__dirname, '../fixtures/data');
const TEST_SCHEMA_DIR = join(__dirname, '../../src/data/schema');

describe('Data Loader Integration Tests', () => {
  describe('Database Loading', () => {
    it('should load and validate the entire database', () => {
      const database = loadDatabase({
        dataDir: TEST_DATA_DIR,
        schemaDir: TEST_SCHEMA_DIR
      });

      // Check ingredients
      expect(Object.keys(database.ingredients)).toHaveLength(2);
      expect(database.ingredients.cetyl_alcohol.name).toBe('Cetyl Alcohol');
      expect(database.ingredients.sd_alcohol.name).toBe('SD Alcohol');

      // Check categories
      expect(Object.keys(database.categories)).toHaveLength(3);
      expect(database.categories.emollient_alcohol.name).toBe('Emollient Alcohols');
      expect(database.categories.drying_alcohol.name).toBe('Drying Alcohols');
      expect(database.categories['non-water-soluble_silicones'].name).toBe('Non-water-soluble Silicones');

      // Check groups
      expect(Object.keys(database.groups)).toHaveLength(1);
      expect(database.groups.alcohols.name).toBe('Alcohols');
    });

    it('should maintain relationships between data types', () => {
      const database = loadDatabase({
        dataDir: TEST_DATA_DIR,
        schemaDir: TEST_SCHEMA_DIR
      });

      // Check ingredient-category relationships
      expect(database.ingredients.cetyl_alcohol.categories).toContain('emollient_alcohol');
      expect(database.ingredients.sd_alcohol.categories).toContain('drying_alcohol');

      // Check category-group relationships
      expect(database.categories.emollient_alcohol.group).toBe('alcohols');
      expect(database.categories.drying_alcohol.group).toBe('alcohols');

      // Verify group exists
      expect(database.groups.alcohols).toBeDefined();
      expect(database.groups.alcohols.name).toBe('Alcohols');
    });

    it('should handle missing optional fields', () => {
      const database = loadDatabase({
        dataDir: TEST_DATA_DIR,
        schemaDir: TEST_SCHEMA_DIR
      });

      // Some ingredients might not have descriptions or synonyms
      expect(database.ingredients.sd_alcohol.description).toBeUndefined();
      expect(database.ingredients.sd_alcohol.synonyms).toBeDefined();
      expect(database.ingredients.sd_alcohol.synonyms).toContain('alcohol denat');
    });
  });
});
