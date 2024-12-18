import { describe, it, expect } from 'vitest';
import { Analyzer } from '../src/analyzer';
import type { System } from '../src/types';
import { testDatabase, testSettings } from './fixtures/test_bundled_data';

describe('Analyzer', () => {
  describe('Basic Ingredient Analysis', () => {
    it('should analyze a single ingredient in the database', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol');

      expect(result.ingredients).toHaveLength(1);
      const ingredient = result.ingredients[0];
      expect(ingredient.normalized).toBe('cetyl alcohol');
      expect(ingredient.ingredient?.id).toBe('cetyl_alcohol');
      expect(result.status).toBe('ok');
    });

    it('should analyze multiple ingredients', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.ingredients).toHaveLength(2);
      expect(result.ingredients[0].normalized).toBe('cetyl alcohol');
      expect(result.ingredients[1].normalized).toBe('sd alcohol');
    });

    it('should handle partial matches', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('hexadecan');

      expect(result.ingredients).toHaveLength(1);
      const ingredient = result.ingredients[0];
      expect(ingredient.normalized).toBe('hexadecan');
      expect(ingredient.ingredient?.id).toBe('cetyl_alcohol');
    });

    it('should handle unknown ingredients', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Unknown Ingredient');

      expect(result.ingredients).toHaveLength(1);
      const ingredient = result.ingredients[0];
      expect(ingredient.normalized).toBe('unknown ingredient');

    });

    it('should handle empty input', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('');

      expect(result.ingredients).toHaveLength(0);
      expect(result.status).toBe('error');
    });

    it('should handle invalid input types', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      // @ts-expect-error Testing invalid input
      const result = analyzer.analyze(null);

      expect(result.status).toBe('error');
      expect(result.ingredients).toHaveLength(0);
    });

    it('should return an error for urls', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('http://www.curlsbot.com');

      expect(result.status).toBe('error');
      expect(result.ingredients).toHaveLength(0);
    });

    it('should return an error for malformed input', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze(
        'Aqua (Water)Alcohol Denat [1]GlycerinMaltodextrinBeta Vulgaris (Beet) Root Juice ExtractHectoritesorbitolchamomilla recutita flower extract [1]Lawsonia Inermis (Henna) Extractcoco glucosideXanthan GumAlginRosmarinus Officinalis (Rosemary) Leaf ExtractcitricacidParfum (Fragrance) [2]Linalool [2]Limonen [2]Eugenol [2]',
      );

      expect(result.status).toBe('error');
      expect(result.ingredients).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should allow getting and setting database', () => {
      const analyzer = new Analyzer();
      analyzer.setDatabase(testDatabase);
      expect(analyzer.getDatabase()).toBe(testDatabase);
    });

    it('should allow getting and setting systems', () => {
      const analyzer = new Analyzer();
      const testSystem: System = {
        id: 'test_system',
        name: 'Test System',
        description: 'Test system for unit tests',
        settings: ['sulfate_free'],
      };
      analyzer.setSystem(testSystem);

      const system = analyzer.getSystem();
      expect(system.id).toBe('test_system');
      expect(system.name).toBe('Test System');
      expect(system.settings).toContain('sulfate_free');
    });
  });

  describe('Setting Processing', () => {
    it('should handle category-based settings', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['sulfate_free']
        }
      });

      const result = analyzer.analyze('Sodium Laureth Sulfate');
      expect(result.status).toBe('warning');
      expect(result.ingredients[0].status).toBe('warning');
      expect(result.reasons[0]).toEqual({
        setting: 'sulfate_free',
        reason: 'Avoid sulfates'
      });
    });

    it('should handle group-based settings with allowed categories', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['mild_detergents_only']
        }
      });

      // Test non-mild detergent
      const resultBad = analyzer.analyze('Sodium Laureth Sulfate');
      expect(resultBad.status).toBe('warning');
      expect(resultBad.ingredients[0].status).toBe('warning');

      // Test mild detergent
      const resultGood = analyzer.analyze('Sodium Cocoyl Isethionate');
      expect(resultGood.status).toBe('ok');
      expect(resultGood.ingredients[0].status).toBe('ok');
    });

    it('should handle water soluble silicones correctly', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['caution_silicones', 'no_water_insoluble_silicones']
        }
      });

      // Test water-soluble silicone
      const resultWaterSoluble = analyzer.analyze('ppg-unknown');
      expect(resultWaterSoluble.status).toBe('caution');
      expect(resultWaterSoluble.ingredients[0].status).toBe('caution');

      // Test non-water-soluble silicone
      const resultNonWaterSoluble = analyzer.analyze('Dimethicone');
      expect(resultNonWaterSoluble.status).toBe('warning');
      expect(resultNonWaterSoluble.ingredients[0].status).toBe('warning');
    });

    it('should handle multiple settings', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['sulfate_free', 'mild_detergents_only']
        }
      });

      const result = analyzer.analyze('Sodium Laureth Sulfate');
      expect(result.status).toBe('warning'); // warning is the most severe status
      expect(result.reasons).toHaveLength(2); // both reasons should be present
      expect(result.reasons.some(r => r.setting === 'sulfate_free')).toBe(true);
      expect(result.reasons.some(r => r.setting === 'mild_detergents_only')).toBe(true);
    });

    it('should pass ingredients that dont match any settings', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['sulfate_free', 'silicone_free']
        }
      });

      const result = analyzer.analyze('Cetyl Alcohol');
      expect(result.status).toBe('ok');
      expect(result.ingredients[0].status).toBe('ok');
      expect(result.reasons).toHaveLength(0);
    });

    it('should handle specific ingredient settings', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['specific_ingredients']
        }
      });

      // Test ingredient that's specifically listed
      const resultListed = analyzer.analyze('Dimethicone');
      expect(resultListed.status).toBe('warning');
      expect(resultListed.ingredients[0].status).toBe('warning');
      expect(resultListed.reasons[0]).toEqual({
        setting: 'specific_ingredients',
        reason: 'Warns about specific ingredients'
      });

      // Test ingredient that's not listed
      const resultNotListed = analyzer.analyze('Cetyl Alcohol');
      expect(resultNotListed.status).toBe('ok');
      expect(resultNotListed.ingredients[0].status).toBe('ok');
      expect(resultNotListed.reasons).toHaveLength(0);
    });

    it('should handle multiple silicone settings in curly_moderate system', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['caution_silicones', 'no_water_insoluble_silicones']
        }
      });

      // Test water-soluble silicone - should be caution
      const resultWaterSoluble = analyzer.analyze('ppg-unknown');
      expect(resultWaterSoluble.status).toBe('caution');
      expect(resultWaterSoluble.ingredients[0].status).toBe('caution');
      expect(resultWaterSoluble.ingredients[0].reasons.some(r => r.setting === 'caution_silicones')).toBe(true);

      // Test non-water-soluble silicone - should be warning
      const resultNonWaterSoluble = analyzer.analyze('Dimethicone');
      expect(resultNonWaterSoluble.status).toBe('warning');
      expect(resultNonWaterSoluble.ingredients[0].status).toBe('warning');
      expect(resultNonWaterSoluble.ingredients[0].reasons.some(r => r.setting === 'no_water_insoluble_silicones')).toBe(true);

      // Test multiple silicones in one list
      const resultMultiple = analyzer.analyze('ppg-unknown, Dimethicone');
      expect(resultMultiple.status).toBe('warning'); // warning takes precedence
      expect(resultMultiple.ingredients[0].status).toBe('caution');
      expect(resultMultiple.ingredients[1].status).toBe('warning');
      expect(resultMultiple.reasons).toHaveLength(2); // both reasons should be present
      expect(resultMultiple.reasons.some(r => r.setting === 'caution_silicones')).toBe(true);
      expect(resultMultiple.reasons.some(r => r.setting === 'no_water_insoluble_silicones')).toBe(true);
    });

    it('should handle evaporative silicones as caution in curly_moderate system', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        settings: testSettings,
        system: {
          id: 'test',
          name: 'Test',
          settings: ['caution_silicones', 'no_water_insoluble_silicones']
        }
      });

      // Test cyclomethicone (an evaporative silicone) - should be caution
      const result = analyzer.analyze('Cyclomethicone');
      expect(result.status).toBe('caution');
      expect(result.ingredients[0].status).toBe('caution');
      expect(result.ingredients[0].reasons[0].setting).toBe('caution_silicones');
    });
  });
});
