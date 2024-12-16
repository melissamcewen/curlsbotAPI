import { describe, it, expect } from 'vitest';
import { getFlags, checkAvoidOthersInCategory, createFlag } from '../src/utils/flagging';
import { testSystem, testSettings, testCategories } from './fixtures/flagTestData';

describe('ingredient flagging utils', () => {
  describe('createFlag', () => {
    it('should create a flag with correct properties', () => {
      const flag = createFlag('sulfate_free', testSettings.sulfate_free, 'ingredient');
      expect(flag).toEqual({
        id: 'sulfate_free',
        name: 'Sulfate Free',
        description: 'Avoid sulfates',
        type: 'ingredient',
        flag_type: 'avoid'
      });
    });
  });

  describe('getFlags', () => {
    it('should flag ingredients correctly', () => {
      const flags = getFlags(
        'test_ingredient',
        { id: 'sodium_laureth_sulfate' },
        [],
        [],
        testSystem,
        testSettings,
        { flaggedIngredients: ['sodium_laureth_sulfate'] }
      );

      expect(flags).toContain('sodium_laureth_sulfate');
    });

    it('should flag categories correctly', () => {
      const flags = getFlags(
        'test_ingredient',
        undefined,
        ['sulfates'],
        [],
        testSystem,
        testSettings,
        { flaggedCategories: ['sulfates'] }
      );

      expect(flags).toContain('sulfates');
    });

    it('should handle empty flags', () => {
      const flags = getFlags(
        'test_ingredient',
        undefined,
        [],
        [],
        testSystem,
        testSettings,
        {}
      );

      expect(flags).toEqual([]);
    });
  });

  describe('checkAvoidOthersInCategory', () => {
    it('should flag ingredients in the same group but not in allowed categories', () => {
      const flags = checkAvoidOthersInCategory(
        'test_ingredient',
        ['harsh_detergents'],
        ['cleansing'],
        testSystem,
        testSettings,
        testCategories
      );

      expect(flags).toContain('mild_detergents_only');
    });

    it('should not flag ingredients in allowed categories', () => {
      const flags = checkAvoidOthersInCategory(
        'test_ingredient',
        ['mild_detergents'],
        ['cleansing'],
        testSystem,
        testSettings,
        testCategories
      );

      expect(flags).not.toContain('mild_detergents_only');
    });

    it('should handle empty categories and groups', () => {
      const flags = checkAvoidOthersInCategory(
        'test_ingredient',
        [],
        [],
        testSystem,
        testSettings,
        testCategories
      );

      expect(flags).toEqual([]);
    });
  });
});
