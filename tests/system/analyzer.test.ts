import { describe, it, expect, vi } from 'vitest';
import { Analyzer } from '../../src/analyzer';
import { getDefaultDatabase } from '../../src/data/defaultDatabase';
import * as bundledData from '../../src/data/bundledData';

describe('Analyzer System Tests', () => {
  describe('System Configuration', () => {
    it('should set system ID in result', () => {
      // Mock bundled settings
      vi.spyOn(bundledData, 'getBundledSettings').mockReturnValue({
        sulfate_free: {
          id: 'sulfate_free',
          name: 'Sulfate Free',
          description: 'Avoid sulfates',
          ingredients: ['sodium_lauryl_sulfate'],
          categories: ['sulfates'],
          flags: ['avoid_sulfates']
        }
      });

      // Mock bundled systems
      vi.spyOn(bundledData, 'getBundledSystems').mockReturnValue([
        {
          id: 'curly_default',
          name: 'Curly Default',
          description: 'Default system for curly hair',
          settings: ['sulfate_free']
        }
      ]);

      const analyzer = new Analyzer({
        database: getDefaultDatabase()
      });

      const result = analyzer.analyze('Cetyl Alcohol', 'curly_default');

      expect(result.system).toBe('curly_default');
      expect(result.settings).toEqual(['sulfate_free']);
    });

    it('should handle unknown system IDs', () => {
      const analyzer = new Analyzer({
        database: getDefaultDatabase()
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

  describe('System Analysis', () => {
    it('should flag sulfates in sulfate_free setting', () => {
      // Mock bundled settings
      vi.spyOn(bundledData, 'getBundledSettings').mockReturnValue({
        sulfate_free: {
          id: 'sulfate_free',
          name: 'Sulfate Free',
          description: 'Avoid sulfates',
          ingredients: ['sls', 'sodium_lauryl_sulfate'],
          categories: ['sulfates'],
          flags: ['avoid_sulfates']
        }
      });

      // Mock bundled systems
      vi.spyOn(bundledData, 'getBundledSystems').mockReturnValue([
        {
          id: 'curly_default',
          name: 'Curly Default',
          description: 'Default system for curly hair',
          settings: ['sulfate_free']
        }
      ]);

      const analyzer = new Analyzer({
        database: getDefaultDatabase()
      });

      const result = analyzer.analyze('Sodium Lauryl Sulfate', 'curly_default');

      expect(result.flags.flaggedCategories).toEqual(['sulfates']);
      expect(result.flags.flaggedIngredients).toEqual(['sls', 'sodium_lauryl_sulfate']);

      // Check that the match has the flag
      const match = result.matches.find(m => m.normalized === 'sodium lauryl sulfate');
      expect(match?.flags).toContain('sulfates');
      expect(match?.flags).toContain('sodium_lauryl_sulfate');
    });

    it('should combine system flags with analyzer options', () => {
      // Mock bundled settings
      vi.spyOn(bundledData, 'getBundledSettings').mockReturnValue({
        sulfate_free: {
          id: 'sulfate_free',
          name: 'Sulfate Free',
          description: 'Avoid sulfates',
          ingredients: ['sls', 'sodium_lauryl_sulfate'],
          categories: ['sulfates'],
          flags: ['avoid_sulfates']
        }
      });

      // Mock bundled systems
      vi.spyOn(bundledData, 'getBundledSystems').mockReturnValue([
        {
          id: 'curly_default',
          name: 'Curly Default',
          description: 'Default system for curly hair',
          settings: ['sulfate_free']
        }
      ]);

      const analyzer = new Analyzer({
        database: getDefaultDatabase(),
        options: {
          flaggedIngredients: ['cetyl_alcohol']
        }
      });

      const result = analyzer.analyze('Sodium Lauryl Sulfate, Cetyl Alcohol', 'curly_default');

      expect(result.flags.flaggedCategories).toEqual(['sulfates']); // From system
      expect(result.flags.flaggedIngredients).toContain('cetyl_alcohol'); // From options
      expect(result.flags.flaggedIngredients).toContain('sls'); // From system
      expect(result.flags.flaggedIngredients).toContain('sodium_lauryl_sulfate'); // From system
    });

    it('should set success status for valid analysis', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('Cetyl Alcohol');
      expect(result.status).toBe('success');
    });

    it('should set error status for invalid input', () => {
      const analyzer = new Analyzer();
      const result = analyzer.analyze('');
      expect(result.status).toBe('error');
    });
  });
});
