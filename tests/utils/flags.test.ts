import { describe, it, expect } from 'vitest';
import { getSystemFlags, mergeFlags } from '../../src/utils/flags';
import type { System } from '../../src/types';

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
      const system: System = {
        id: 'test',
        name: 'Test System',
        description: 'Test system',
        settings: ['sulfate_free']
      };

      const flags = getSystemFlags(system);
      expect(flags.flaggedCategories).toContain('sulfates');
    });

    it('should handle multiple settings', () => {
      const system: System = {
        id: 'test',
        name: 'Test System',
        description: 'Test system',
        settings: ['sulfate_free', 'other_setting']
      };

      const flags = getSystemFlags(system);
      expect(flags.flaggedCategories).toContain('sulfates');
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
