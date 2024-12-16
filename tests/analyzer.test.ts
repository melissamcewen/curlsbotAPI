import { describe, it, expect } from 'vitest';

import { Analyzer } from '../src/analyzer';

import {
  testDatabase,
  testSettings,
} from './fixtures/test_bundled_data';

describe('Analyzer', () => {
  describe('Basic Ingredient Analysis', () => {
    it('should analyze a single ingredient in the database', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('cetyl alcohol');
      expect(match.categories).toContain('emollient_alcohols');
      expect(match.groups).toContain('alcohols');
      expect(match.ingredient?.id).toBe('cetyl_alcohol')
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

    it('should handle partial matches', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('hexadecan');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('hexadecan');
      expect(match.ingredient?.id).toBe('cetyl_alcohol');
    });

    it('should handle unknown ingredients', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Unknown Ingredient');

      expect(result.matches).toHaveLength(1);
      const match = result.matches[0];
      expect(match.normalized).toBe('unknown ingredient');
      expect(match.categories).toHaveLength(0);
      expect(match.groups).toHaveLength(0);
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
          settings: ['sulfate_free'],
        },
      ];
      analyzer.setSystems(testSystems);

      const systems = analyzer.getSystems();
      expect(systems).toHaveLength(1);
      expect(systems[0].id).toBe('test_system');
      expect(systems[0].name).toBe('Test System');
      expect(systems[0].settings).toContain('sulfate_free');
    });
  });


});
