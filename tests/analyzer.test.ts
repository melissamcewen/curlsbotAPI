import { describe, expect, it } from 'vitest';

import { Analyzer } from '../src/analyzer';
import { defaultDatabase, defaultSystems, defaultSettings } from '../src/data/bundledData';

describe('Analyzer', () => {
  describe('Basic Ingredient Analysis', () => {
    it('should analyze a single ingredient', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('Cetyl Alcohol');

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].normalized).toBe('cetyl alcohol');
      expect(result.matches[0].categories).toContain('emollient_alcohols');
    });

    it('should analyze multiple ingredients', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].normalized).toBe('cetyl alcohol');
      expect(result.matches[1].normalized).toBe('sd alcohol');
    });

    it('should handle unknown ingredients', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('Unknown Ingredient');

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].normalized).toBe('unknown ingredient');
      expect(result.matches[0].categories).toEqual([]);
    });

    it('should handle empty input', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('');

      expect(result.matches).toHaveLength(0);
    });
  });

  describe('Categories and Groups', () => {
    it('should collect unique categories and groups', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.categories).toEqual(['emollient_alcohols', 'drying_alcohols']);
      expect(result.groups).toEqual(['alcohols']);
    });

    it('should flag sulfates in sulfate_free setting', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('Sodium Lauryl Sulfate', 'curly_default');

      expect(result.flags.flaggedCategories).toEqual(['sulfates']);
      expect(result.flags.flaggedIngredients).toEqual(['sls', 'sodium_lauryl_sulfate']);
    });
  });

  describe('Configuration and Options', () => {
    it('should apply flags when options are set', () => {
      const analyzer = new Analyzer({
        database: defaultDatabase,
        systems: defaultSystems,
        settings: defaultSettings
      });

      const result = analyzer.analyze('SD Alcohol');
      const sdAlcoholMatch = result.matches.find(m => m.ingredient?.id === 'sd_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('sd_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('drying_alcohols');
      expect(sdAlcoholMatch?.flags).toContain('alcohols');
    });

    it('should combine system flags with analyzer options', () => {
      const analyzer = new Analyzer({
        database: defaultDatabase,
        systems: defaultSystems,
        settings: defaultSettings
      });

      const result = analyzer.analyze('Sodium Lauryl Sulfate, Cetyl Alcohol', 'curly_default');

      expect(result.flags.flaggedCategories).toEqual(['sulfates']);
      expect(result.flags.flaggedIngredients).toContain('cetyl_alcohol');
      expect(result.flags.flaggedIngredients).toContain('sls');
    });

    it('should set system ID in result', () => {
      const analyzer = new Analyzer({
        database: defaultDatabase,
        systems: defaultSystems,
        settings: defaultSettings
      });

      const result = analyzer.analyze('Sodium Lauryl Sulfate', 'curly_default');

      expect(result.system).toBe('curly_default');
      expect(result.settings).toEqual(['mild_detergents_only']);
    });

    it('should handle unknown system IDs', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('Sodium Lauryl Sulfate', 'unknown_system');

      expect(result.system).toBe('unknown_system');
      expect(result.settings).toEqual([]);
    });

    it('should allow getting and setting systems', () => {
      const analyzer = new Analyzer();
      const newSystems = {
        test_system: {
          id: 'test_system',
          name: 'Test System',
          settings: ['sulfate_free']
        }
      };

      analyzer.setSystems(newSystems);
      expect(analyzer.getSystems()).toEqual(newSystems);
    });
  });

  describe('avoid_others_in_category Setting', () => {
    it('should flag detergents not in allowed categories but not mild ones', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('harsh detergent, mild detergent', {
        settings: ['avoid_others_in_category'],
        allowedCategories: ['mild_detergents']
      });

      // Should flag harsh detergent
      const harshMatch = result.matches.find(m => m.normalized === 'harsh detergent');
      expect(harshMatch?.flags).toHaveLength(1);

      // Should not flag mild detergent
      const mildMatch = result.matches.find(m => m.normalized === 'mild detergent');
      expect(mildMatch?.flags).toHaveLength(0);
    });
  });
});
