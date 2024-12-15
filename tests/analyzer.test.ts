import { describe, expect, it } from 'vitest';

import { Analyzer } from '../src/analyzer';
import { testDatabase } from './fixtures/testDatabase';
import { mockFallbackDatabase } from './fixtures/fallbackDatabase';

describe('Analyzer', () => {
  describe('Basic Ingredient Analysis', () => {
    it('should analyze a single ingredient', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('cetyl alcohol');
      expect(match.categories).toContain('emollient_alcohols');
      expect(match.groups).toContain('alcohols');
      expect(match.ingredient?.id).toBe('cetyl_alcohol');
    });

    it('should analyze multiple ingredients', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.matches).toHaveLength(2);

      const [cetyl, sd] = result.matches;
      expect(cetyl.normalized).toBe('cetyl alcohol');
      expect(cetyl.categories).toContain('emollient_alcohols');

      expect(sd.normalized).toBe('sd alcohol');
      expect(sd.categories).toContain('drying_alcohols');
    });

    it('should handle unknown ingredients', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Unknown Ingredient');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('unknown ingredient');
      expect(match.categories).toEqual([]);
      expect(match.groups).toEqual([]);
      expect(match.ingredient).toBeUndefined();
    });

    it('should handle empty input', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('');

      expect(result.matches).toHaveLength(0);
      expect(result.status).toBe('error');
    });

    it('should handle invalid input types', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      // @ts-expect-error Testing invalid input
      const result = analyzer.analyze(null);

      expect(result.status).toBe('error');
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('Categories and Groups', () => {
    it('should collect unique categories and groups', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.categories).toContain('emollient_alcohols');
      expect(result.categories).toContain('drying_alcohols');
      expect(result.groups).toContain('alcohols');
      expect(result.groups).toHaveLength(1); // Should only have one unique group
    });

    it('should handle ingredients with multiple categories', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Sodium Laureth Sulfate');

      expect(result.categories).toContain('surfactants');
      expect(result.categories).toContain('sulfates');
      expect(result.groups).toContain('detergents');
    });
  });

  describe('Fallback Database', () => {
    it('should use fallback database when ingredient not found in main', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        fallbackDatabase: mockFallbackDatabase
      });
      const result = analyzer.analyze('cone');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_non_water_soluble_silicones');
      expect(match.categories).toContain('non-water-soluble_silicones');
    });

    it('should prefer main database over fallback', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        fallbackDatabase: mockFallbackDatabase
      });
      const result = analyzer.analyze('Cetyl Alcohol');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('cetyl_alcohol');
      expect(match.categories).toContain('emollient_alcohols');
    });
  });

  describe('System Settings', () => {
    const testSystems = [{
      id: 'test_system',
      name: 'Test System',
      settings: ['mild_detergents_only']
    }];

    const testSettings = {
      mild_detergents_only: {
        id: 'mild_detergents_only',
        name: 'Mild Detergents Only',
        description: 'Only allow mild detergents',
        flags: ['avoid_others_in_category'],
        categories: ['mild_detergents'],
        ingredients: []
      }
    };

    it('should apply system settings correctly', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        systems: testSystems,
        settings: testSettings
      });

      const result = analyzer.analyze('Sodium Laureth Sulfate', 'test_system');

      expect(result.system).toBe('test_system');
      expect(result.settings).toContain('mild_detergents_only');
      expect(result.matches[0].flags).toContain('mild_detergents_only');
    });

    it('should handle unknown system IDs', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        systems: testSystems,
        settings: testSettings
      });

      const result = analyzer.analyze('Sodium Laureth Sulfate', 'unknown_system');

      expect(result.system).toBe('unknown_system');
      expect(result.settings).toEqual([]);
      expect(result.matches[0].flags).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should allow getting and setting database', () => {
      const analyzer = new Analyzer();
      analyzer.setDatabase(testDatabase);
      expect(analyzer.getDatabase()).toBe(testDatabase);
    });

    it('should allow getting and setting fallback database', () => {
      const analyzer = new Analyzer();
      analyzer.setFallbackDatabase(mockFallbackDatabase);
      expect(analyzer.getFallbackDatabase()).toBe(mockFallbackDatabase);
    });

    it('should allow getting and setting systems', () => {
      const analyzer = new Analyzer();
      const testSystems = [{
        id: 'test_system',
        name: 'Test System',
        settings: ['test_setting']
      }];
      analyzer.setSystems(testSystems);
      expect(analyzer.getSystems()).toEqual(testSystems);
    });
  });
});
