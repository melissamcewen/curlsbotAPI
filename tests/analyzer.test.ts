import { describe, it, expect } from 'vitest';

import { Analyzer } from '../src/analyzer';

import {
  testDatabase,
} from './fixtures/test_bundled_data';
import { testSystem, testSettings } from './fixtures/flagTestData';

describe('Analyzer', () => {
  describe('Basic Ingredient Analysis', () => {
    it('should analyze a single ingredient in the databasewith full confidence', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('cetyl alcohol');
      expect(match.categories).toContain('emollient_alcohols');
      expect(match.groups).toContain('alcohols');
      expect(match.ingredient?.id).toBe('cetyl_alcohol');
      expect(match.confidence).toBe(1.0);
    });

    it('should analyze multiple ingredients with appropriate confidence', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      expect(result.matches).toHaveLength(2);

      const [cetyl, sd] = result.matches;
      expect(cetyl.normalized).toBe('cetyl alcohol');
      expect(cetyl.categories).toContain('emollient_alcohols');
      expect(cetyl.confidence).toBe(1.0);

      expect(sd.normalized).toBe('sd alcohol');
      expect(sd.categories).toContain('drying_alcohols');
      expect(sd.confidence).toBe(1.0);
    });

    it('should handle partial matches with lower confidence', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('hexadecan');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('hexadecan');
      expect(match.ingredient?.id).toBe('cetyl_alcohol');
      expect(match.confidence).toBe(0.7);
    });

    it('should handle unknown ingredients with no confidence', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Unknown Ingredient');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('unknown ingredient');
      expect(match.categories).toEqual([]);
      expect(match.groups).toEqual([]);
      expect(match.ingredient).toBeUndefined();
      expect(match.confidence).toBeUndefined();
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

  describe('Configuration', () => {
    it('should allow getting and setting database', () => {
      const analyzer = new Analyzer();
      analyzer.setDatabase(testDatabase);
      expect(analyzer.getDatabase()).toBe(testDatabase);
    });

    it('should allow getting and setting systems', () => {
      const analyzer = new Analyzer();
      const testSystems = [
        {
          id: 'test_system',
          name: 'Test System',
          settings: ['mild_detergents_only'],
        },
      ];
      analyzer.setSystems(testSystems);
      expect(analyzer.getSystems()).toEqual(testSystems);
    });
  });

  describe('analyze', () => {
    it('should create flags from settings', () => {
      const analyzer = new Analyzer({
        systems: [testSystem],
        settings: testSettings
      });

      const result = analyzer.analyze('sodium laureth sulfate', 'test_system');

      // Check that the flag was created correctly
      expect(result.flags['sulfate_free']).toEqual({
        id: 'sulfate_free',
        name: 'Sulfate Free',
        description: 'Avoid sulfates',
        type: 'ingredient',
        flag_type: 'avoid'
      });
    });

    it('should handle avoid_others_in_category flags', () => {
      const analyzer = new Analyzer({
        systems: [testSystem],
        settings: testSettings
      });

      const result = analyzer.analyze('sodium cocoyl isethionate', 'test_system');

      // Check that mild_detergents_only flag was created
      expect(result.flags['mild_detergents_only']).toEqual({
        id: 'mild_detergents_only',
        name: 'Mild Detergents Only',
        description: 'Only allow mild detergents',
        type: 'category',
        flag_type: 'avoid_others_in_category'
      });
    });

    it('should not create duplicate flags', () => {
      const analyzer = new Analyzer({
        systems: [testSystem],
        settings: testSettings
      });

      const result = analyzer.analyze('sodium laureth sulfate, sodium lauryl sulfate', 'test_system');

      // Even though both ingredients are sulfates, we should only have one sulfate_free flag
      expect(Object.keys(result.flags)).toHaveLength(1);
      expect(result.flags['sulfate_free']).toBeDefined();
    });
  });
});
