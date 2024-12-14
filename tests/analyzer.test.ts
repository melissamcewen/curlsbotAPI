import { join } from 'path';
import { Analyzer } from '../src/analyzer';
import { loadDatabase } from '../src/utils/dataLoader';
import { clearDefaultDatabase } from '../src/data/defaultDatabase';

// Use test data but real schemas
const TEST_DATA_DIR = join(__dirname, 'fixtures/data');
const SCHEMA_DIR = join(__dirname, '../src/data/schema');

describe('Analyzer', () => {
  beforeEach(() => {
    // Clear the default database cache before each test
    clearDefaultDatabase();
  });

  describe('Constructor', () => {
    it('should use default database when no config is provided', () => {
      const analyzer = new Analyzer();
      const database = analyzer.getDatabase();
      expect(database).toBeDefined();
      expect(database.ingredients).toBeDefined();
      expect(database.categories).toBeDefined();
      expect(database.groups).toBeDefined();
    });

    it('should use provided database when config is provided', () => {
      const customDatabase = loadDatabase({
        dataDir: TEST_DATA_DIR,
        schemaDir: SCHEMA_DIR,
      });
      const analyzer = new Analyzer({ database: customDatabase });
      const database = analyzer.getDatabase();

      // Check ingredients
      expect(Object.keys(database.ingredients)).toHaveLength(2);
      expect(database.ingredients.cetyl_alcohol.name).toBe('Cetyl Alcohol');
      expect(database.ingredients.sd_alcohol.name).toBe('SD Alcohol');

      // Check categories
      expect(Object.keys(database.categories)).toHaveLength(2);
      expect(database.categories.emollient_alcohol.name).toBe(
        'Emollient Alcohols',
      );
      expect(database.categories.drying_alcohol.name).toBe('Drying Alcohols');

      // Check groups
      expect(Object.keys(database.groups)).toHaveLength(1);
      expect(database.groups.alcohols.name).toBe('Alcohols');
    });
  });

  describe('Database Management', () => {
    it('should allow updating the database', () => {
      const analyzer = new Analyzer();
      const customDatabase = loadDatabase({
        dataDir: TEST_DATA_DIR,
        schemaDir: SCHEMA_DIR,
      });

      analyzer.setDatabase(customDatabase);
      const database = analyzer.getDatabase();

      expect(Object.keys(database.ingredients)).toHaveLength(2);
      expect(database.ingredients.cetyl_alcohol.name).toBe('Cetyl Alcohol');
    });
  });

  describe('Options Management', () => {
    it('should allow setting and getting options', () => {
      const analyzer = new Analyzer();
      const options = {
        flaggedIngredients: ['sd_alcohol'],
        flaggedCategories: ['drying_alcohol'],
        flaggedGroups: ['alcohols'],
      };

      analyzer.setOptions(options);
      expect(analyzer.getOptions()).toEqual(options);
    });
  });

  describe('Data Access', () => {
    it('should provide access to ingredients, categories, and groups', () => {
      const customDatabase = loadDatabase({
        dataDir: TEST_DATA_DIR,
        schemaDir: SCHEMA_DIR,
      });
      const analyzer = new Analyzer({ database: customDatabase });

      const ingredients = analyzer.getIngredients();
      const categories = analyzer.getCategories();
      const groups = analyzer.getGroups();

      expect(Object.keys(ingredients)).toHaveLength(2);
      expect(Object.keys(categories)).toHaveLength(2);
      expect(Object.keys(groups)).toHaveLength(1);

      // Check specific items exist
      expect(ingredients.cetyl_alcohol).toBeDefined();
      expect(categories.emollient_alcohol).toBeDefined();
      expect(groups.alcohols).toBeDefined();
    });
  });

  describe('Analysis', () => {
    it('should return empty result for invalid input', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('');

      expect(result.uuid).toBeDefined();
      expect(result.input).toBe('');
      expect(result.normalized).toHaveLength(0);
      expect(result.matches).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
      expect(result.groups).toHaveLength(0);
      expect(result.flags.ingredients).toHaveLength(0);
      expect(result.flags.categories).toHaveLength(0);
      expect(result.flags.groups).toHaveLength(0);
    });

    it('should set system in result when provided', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('test', 'default_curly');

      expect(result.system).toBe('default_curly');
    });
  });
});
