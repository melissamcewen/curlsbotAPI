import { describe, it, expect, vi } from 'vitest';
import { getSystemFlags, mergeFlags } from '../../src/utils/flags';
import type { System, Setting } from '../../src/types';
import * as bundledData from '../../src/data/bundledData';

describe('flags utils', () => {
  describe('getSystemFlags', () => {
    it('should return empty flags for undefined system', () => {
      const flags = getSystemFlags(undefined);
      expect(flags).toEqual({
        flaggedIngredients: [],
        flaggedCategories: [],
        flaggedGroups: []
      });
    });

    it('should handle sulfate_free setting', () => {
      // Mock the bundled settings
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

      const system: System = {
        id: 'test',
        name: 'Test System',
        description: 'Test system',
        settings: ['sulfate_free']
      };

      const flags = getSystemFlags(system);
      expect(flags.flaggedIngredients).toContain('sodium_lauryl_sulfate');
      expect(flags.flaggedCategories).toContain('sulfates');
      expect(flags.flaggedGroups).toContain('avoid_sulfates');
    });

    it('should handle multiple settings', () => {
      // Mock the bundled settings
      vi.spyOn(bundledData, 'getBundledSettings').mockReturnValue({
        sulfate_free: {
          id: 'sulfate_free',
          name: 'Sulfate Free',
          description: 'Avoid sulfates',
          ingredients: ['sodium_lauryl_sulfate'],
          categories: ['sulfates'],
          flags: ['avoid_sulfates']
        },
        silicone_free: {
          id: 'silicone_free',
          name: 'Silicone Free',
          description: 'Avoid silicones',
          ingredients: [],
          categories: ['silicones'],
          flags: ['avoid_silicones']
        }
      });

      const system: System = {
        id: 'test',
        name: 'Test System',
        description: 'Test system',
        settings: ['sulfate_free', 'silicone_free']
      };

      const flags = getSystemFlags(system);
      expect(flags.flaggedCategories).toContain('sulfates');
      expect(flags.flaggedCategories).toContain('silicones');
      expect(flags.flaggedGroups).toContain('avoid_sulfates');
      expect(flags.flaggedGroups).toContain('avoid_silicones');
    });
  });

  describe('mergeFlags', () => {
    it('should merge multiple flag sources', () => {
      const flags1 = {
        flaggedIngredients: ['ing1'],
        flaggedCategories: ['cat1'],
        flaggedGroups: ['group1']
      };

      const flags2 = {
        flaggedIngredients: ['ing2'],
        flaggedCategories: ['cat2'],
        flaggedGroups: ['group2']
      };

      const merged = mergeFlags(flags1, flags2);
      expect(merged.flaggedIngredients).toEqual(['ing1', 'ing2']);
      expect(merged.flaggedCategories).toEqual(['cat1', 'cat2']);
      expect(merged.flaggedGroups).toEqual(['group1', 'group2']);
    });

    it('should remove duplicates', () => {
      const flags1 = {
        flaggedIngredients: ['ing1'],
        flaggedCategories: ['cat1'],
        flaggedGroups: ['group1']
      };

      const flags2 = {
        flaggedIngredients: ['ing1'], // Duplicate
        flaggedCategories: ['cat1'], // Duplicate
        flaggedGroups: ['group1'] // Duplicate
      };

      const merged = mergeFlags(flags1, flags2);
      expect(merged.flaggedIngredients).toEqual(['ing1']);
      expect(merged.flaggedCategories).toEqual(['cat1']);
      expect(merged.flaggedGroups).toEqual(['group1']);
    });

    it('should handle empty or undefined flags', () => {
      const flags1 = {
        flaggedIngredients: ['ing1']
      };

      const flags2 = {
        flaggedCategories: ['cat1']
      };

      const merged = mergeFlags(flags1, flags2, {});
      expect(merged.flaggedIngredients).toEqual(['ing1']);
      expect(merged.flaggedCategories).toEqual(['cat1']);
      expect(merged.flaggedGroups).toEqual([]);
    });
  });
});
