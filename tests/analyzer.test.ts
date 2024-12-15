import { describe, it, expect } from 'vitest';

import { Analyzer } from '../src/analyzer';
import { defaultDatabase, defaultSystems, defaultSettings } from '../src/data/bundledData';
import { testDatabase } from './fixtures/testDatabase';

describe('Analyzer', () => {
  describe('Basic Ingredient Analysis', () => {
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

    it('should set success status for valid analysis', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol');
      expect(result.status).toBe('success');
    });

    it('should set error status for invalid input', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('');
      expect(result.status).toBe('error');
    });
  });

  describe('Categories and Groups', () => {
    it('should collect unique categories and groups', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.categories).toEqual(['emollient_alcohol', 'drying_alcohol']);
      expect(result.groups).toEqual(['alcohols']);
    });

    it('should flag sulfates in sulfate_free setting', () => {
      const analyzer = new Analyzer({
        database: defaultDatabase,
        systems: defaultSystems,
        settings: defaultSettings
      });

      const result = analyzer.analyze('Sodium Lauryl Sulfate', 'curly_default');

      expect(result.flags.flaggedCategories).toEqual(['sulfates']);
      expect(result.flags.flaggedIngredients).toEqual(['sls', 'sodium_lauryl_sulfate']);

      const match = result.matches.find(m => m.normalized === 'sodium lauryl sulfate');
      expect(match?.flags).toContain('sulfates');
      expect(match?.flags).toContain('sodium_lauryl_sulfate');
    });
  });

  describe('Configuration and Options', () => {
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

      const sdAlcoholMatch = result.matches.find(m => m.ingredient?.id === 'sd_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('sd_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('drying_alcohol');
      expect(sdAlcoholMatch?.flags).toContain('alcohols');
    });

    it('should combine system flags with analyzer options', () => {
      const analyzer = new Analyzer({
        database: defaultDatabase,
        systems: defaultSystems,
        settings: defaultSettings,
        options: {
          flaggedIngredients: ['cetyl_alcohol']
        }
      });

      const result = analyzer.analyze('Sodium Lauryl Sulfate, Cetyl Alcohol', 'curly_default');

      expect(result.flags.flaggedCategories).toEqual(['sulfates']);
      expect(result.flags.flaggedIngredients).toContain('cetyl_alcohol');
      expect(result.flags.flaggedIngredients).toContain('sls');
      expect(result.flags.flaggedIngredients).toContain('sodium_lauryl_sulfate');
    });

    it('should set system ID in result', () => {
      const analyzer = new Analyzer({
        database: defaultDatabase,
        systems: defaultSystems,
        settings: defaultSettings
      });

      const result = analyzer.analyze('Cetyl Alcohol', 'curly_default');

      expect(result.system).toBe('curly_default');
      expect(result.settings).toEqual(['sulfate_free']);
    });

    it('should handle unknown system IDs', () => {
      const analyzer = new Analyzer({
        database: defaultDatabase,
        systems: defaultSystems,
        settings: defaultSettings
      });

      const result = analyzer.analyze('Cetyl Alcohol', 'unknown_system');

      expect(result.system).toBe('unknown_system');
      expect(result.settings).toEqual([]);
      expect(result.flags).toEqual({
        flaggedIngredients: [],
        flaggedCategories: [],
        flaggedGroups: []
      });
    });

    it('should allow getting and setting systems', () => {
      const analyzer = new Analyzer();
      const systems = analyzer.getSystems();
      expect(systems).toBeDefined();

      const newSystems = [{ id: 'test', name: 'Test', settings: [] }];
      analyzer.setSystems(newSystems);
      expect(analyzer.getSystems()).toEqual(newSystems);
    });
  });
});
