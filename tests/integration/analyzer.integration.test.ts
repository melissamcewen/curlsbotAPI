import { describe, it, expect } from 'vitest';
import { Analyzer } from '../../src/analyzer';
import { testDatabase } from '../fixtures/testDatabase';

describe('Analyzer Integration Tests', () => {
  describe('Ingredient Matching', () => {
    it('should normalize and match basic ingredients', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.normalized).toEqual(['cetyl alcohol', 'sd alcohol']);
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].ingredient?.id).toBe('cetyl_alcohol');
      expect(result.matches[1].ingredient?.id).toBe('sd_alcohol');
    });

    it('should match ingredients by synonyms', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('hexadecan-1-ol');

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].ingredient?.id).toBe('cetyl_alcohol');
    });
  });

  describe('Category and Group Collection', () => {
    it('should collect unique categories and groups', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.categories).toEqual(['emollient_alcohol', 'drying_alcohol']);
      expect(result.groups).toEqual(['alcohols']);
    });

    it('should apply flags when options are set', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        options: {
          flaggedIngredients: ['sd_alcohol'],
          flaggedCategories: ['drying_alcohol'],
          flaggedGroups: ['alcohols']
        }
      });

      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.flags).toEqual({
        flaggedIngredients: ['sd_alcohol'],
        flaggedCategories: ['drying_alcohol'],
        flaggedGroups: ['alcohols']
      });

      // Check that matches have correct flags
      const sdAlcoholMatch = result.matches.find(m => m.ingredient?.id === 'sd_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('sd_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('drying_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('alcohols');
    });
  });
});
