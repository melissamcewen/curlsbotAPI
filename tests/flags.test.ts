import { describe, it, expect } from 'vitest';

import { getSystemFlags, mergeFlags } from '../src/utils/flags';

import type { System } from '../src/types';
import { testDatabase, testSettings } from './fixtures/test_bundled_data';

describe('flags utils', () => {
  describe('getSystemFlags', () => {
    it('should return empty flags for undefined system', () => {
      const flags = getSystemFlags(undefined, testSettings);
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
        settings: ['sulfate_free']
      };

      const flags = getSystemFlags(system, testSettings);
      expect(flags.flaggedIngredients).toContain('sodium_laureth_sulfate');
      expect(flags.flaggedCategories).toContain('sulfates');
      expect(flags.flaggedGroups).toContain('avoid_sulfates');
    });

    it('should handle multiple settings', () => {
      const system: System = {
        id: 'test',
        name: 'Test System',
        settings: ['sulfate_free', 'silicone_free']
      };

      const flags = getSystemFlags(system, testSettings);
      // Check ingredients
      expect(flags.flaggedIngredients).toContain('sodium_laureth_sulfate');
      expect(flags.flaggedIngredients).toContain('dimethicone');

      // Check categories
      expect(flags.flaggedCategories).toContain('sulfates');
      expect(flags.flaggedCategories).toContain('non-water-soluble_silicones');

      // Check groups
      expect(flags.flaggedGroups).toContain('avoid_sulfates');
      expect(flags.flaggedGroups).toContain('avoid_silicones');
    });

    it('should handle avoid_others_in_category flag', () => {
      const system: System = {
        id: 'test',
        name: 'Test System',
        settings: ['mild_detergents_only']
      };

      const flags = getSystemFlags(system, testSettings);
      expect(flags.flaggedCategories).toContain('mild-detergents');
      expect(flags.flaggedGroups).toContain('avoid_others_in_category');
    });

    it('should handle unknown settings gracefully', () => {
      const system: System = {
        id: 'test',
        name: 'Test System',
        settings: ['unknown_setting']
      };

      const flags = getSystemFlags(system, testSettings);
      expect(flags.flaggedIngredients).toEqual([]);
      expect(flags.flaggedCategories).toEqual([]);
      expect(flags.flaggedGroups).toEqual([]);
    });
  });

  describe('mergeFlags', () => {
    it('should merge multiple flag sources', () => {
      const flags1 = {
        flaggedIngredients: ['sodium_laureth_sulfate'],
        flaggedCategories: ['sulfates'],
        flaggedGroups: ['avoid_sulfates']
      };

      const flags2 = {
        flaggedIngredients: ['dimethicone'],
        flaggedCategories: ['non-water-soluble_silicones'],
        flaggedGroups: ['avoid_silicones']
      };

      const merged = mergeFlags(flags1, flags2);
      expect(merged.flaggedIngredients).toContain('sodium_laureth_sulfate');
      expect(merged.flaggedIngredients).toContain('dimethicone');
      expect(merged.flaggedCategories).toContain('sulfates');
      expect(merged.flaggedCategories).toContain('non-water-soluble_silicones');
      expect(merged.flaggedGroups).toContain('avoid_sulfates');
      expect(merged.flaggedGroups).toContain('avoid_silicones');
    });

    it('should remove duplicates', () => {
      const flags1 = {
        flaggedIngredients: ['sodium_laureth_sulfate'],
        flaggedCategories: ['sulfates'],
        flaggedGroups: ['avoid_sulfates']
      };

      const flags2 = {
        flaggedIngredients: ['sodium_laureth_sulfate'],
        flaggedCategories: ['sulfates'],
        flaggedGroups: ['avoid_sulfates']
      };

      const merged = mergeFlags(flags1, flags2);
      expect(merged.flaggedIngredients).toEqual(['sodium_laureth_sulfate']);
      expect(merged.flaggedCategories).toEqual(['sulfates']);
      expect(merged.flaggedGroups).toEqual(['avoid_sulfates']);
      expect(merged.flaggedIngredients.length).toBe(1);
      expect(merged.flaggedCategories.length).toBe(1);
      expect(merged.flaggedGroups.length).toBe(1);
    });

    it('should handle empty or undefined flags', () => {
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
