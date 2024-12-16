import { describe, test, expect } from 'vitest';
import { getSystemFlags, mergeFlags } from '../src/utils/flags';
import { testSystem, testSettings } from './fixtures/flagTestData';

describe('system flags utils', () => {
  describe('getSystemFlags', () => {
    test('should return empty flags for undefined system', () => {
      const flags = getSystemFlags(undefined, testSettings);
      expect(flags).toEqual({
        flaggedIngredients: [],
        flaggedCategories: [],
        flaggedGroups: []
      });
    });

    test('should handle sulfate_free setting', () => {
      const flags = getSystemFlags(testSystem, testSettings);
      expect(flags.flaggedIngredients).toContain('sodium_laureth_sulfate');
      expect(flags.flaggedCategories).toContain('sulfates');
    });

    test('should handle avoid_others_in_category flag', () => {
      const flags = getSystemFlags(testSystem, testSettings);
      expect(flags.flaggedCategories).toContain('mild_detergents');
    });

    test('should handle unknown settings gracefully', () => {
      const systemWithUnknown = {
        ...testSystem,
        settings: ['unknown_setting']
      };

      const flags = getSystemFlags(systemWithUnknown, testSettings);
      expect(flags.flaggedIngredients).toEqual([]);
      expect(flags.flaggedCategories).toEqual([]);
      expect(flags.flaggedGroups).toEqual([]);
    });
  });

  describe('mergeFlags', () => {
    test('should merge multiple flag sources', () => {
      const flags1 = {
        flaggedIngredients: ['sodium_laureth_sulfate'],
        flaggedCategories: ['sulfates']
      };

      const flags2 = {
        flaggedIngredients: ['dimethicone'],
        flaggedCategories: ['silicones']
      };

      const merged = mergeFlags(flags1, flags2);
      expect(merged.flaggedIngredients).toContain('sodium_laureth_sulfate');
      expect(merged.flaggedIngredients).toContain('dimethicone');
      expect(merged.flaggedCategories).toContain('sulfates');
      expect(merged.flaggedCategories).toContain('silicones');
    });

    test('should remove duplicates', () => {
      const flags1 = {
        flaggedIngredients: ['sodium_laureth_sulfate'],
        flaggedCategories: ['sulfates']
      };

      const flags2 = {
        flaggedIngredients: ['sodium_laureth_sulfate'],
        flaggedCategories: ['sulfates']
      };

      const merged = mergeFlags(flags1, flags2);
      expect(merged.flaggedIngredients).toEqual(['sodium_laureth_sulfate']);
      expect(merged.flaggedCategories).toEqual(['sulfates']);
      expect(merged.flaggedIngredients.length).toBe(1);
      expect(merged.flaggedCategories.length).toBe(1);
    });

    test('should handle empty or undefined flags', () => {
      const flags1 = {
        flaggedIngredients: ['sodium_laureth_sulfate']
      };

      const flags2 = {
        flaggedCategories: ['sulfates']
      };

      const merged = mergeFlags(flags1, flags2, {});
      expect(merged.flaggedIngredients).toEqual(['sodium_laureth_sulfate']);
      expect(merged.flaggedCategories).toEqual(['sulfates']);
      expect(merged.flaggedGroups).toEqual([]);
    });
  });
});
