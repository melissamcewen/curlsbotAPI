import { describe, it, expect } from 'vitest';

import {
  findIngredient,
  getIngredientCategories,
  getCategoryGroups,
} from '../src/utils/databaseUtils';

import {
  testDatabase
} from './fixtures/test_bundled_data';

describe('Database Utils', () => {
  describe('findIngredient', () => {
    it('finds ingredient by exact name with full confidence', () => {
      const result = findIngredient(testDatabase, 'cetyl alcohol');
      expect(result?.ingredient.id).toBe('cetyl_alcohol');
      expect(result?.confidence).toBe(1.0);
    });

    it('finds ingredient by exact synonym with full confidence', () => {
      const result = findIngredient(testDatabase, 'hexadecan-1-ol');
      expect(result?.ingredient.id).toBe('cetyl_alcohol');
      expect(result?.confidence).toBe(1.0);
    });

    it('finds ingredient by substring match with high confidence', () => {
      const result = findIngredient(testDatabase, 'hexadecan');
      expect(result?.ingredient.id).toBe('cetyl_alcohol');
      expect(result?.confidence).toBe(0.8);
    });

    it('finds ingredient by superstring match with lower confidence', () => {
      const result = findIngredient(testDatabase, 'super hexadecan-1-ol extra');
      expect(result?.ingredient.id).toBe('cetyl_alcohol');
      expect(result?.confidence).toBe(0.6);
    });

    it('is case insensitive with full confidence', () => {
      const result = findIngredient(testDatabase, 'CETYL ALCOHOL');
      expect(result?.ingredient.id).toBe('cetyl_alcohol');
      expect(result?.confidence).toBe(1.0);
    });

    it('returns undefined for unknown ingredient', () => {
      const result = findIngredient(testDatabase, 'unknown ingredient');
      expect(result).toBeUndefined();
    });


  });

  describe('getIngredientCategories', () => {
    it('gets categories for ingredient', () => {
      const categories = getIngredientCategories(
        testDatabase,
        'emollient_alcohols',
      );
      expect(categories).toEqual(['emollient_alcohols']);
    });

    it('handles multiple categories', () => {
      const categories = getIngredientCategories(testDatabase, [
        'emollient_alcohols',
        'drying_alcohols',
      ]);
      expect(categories).toEqual(['emollient_alcohols', 'drying_alcohols']);
    });

    it('handles unknown categories', () => {
      const categories = getIngredientCategories(
        testDatabase,
        'unknown_category',
      );
      expect(categories).toEqual([]);
    });

    it('returns empty array for empty input', () => {
      const categories = getIngredientCategories(testDatabase, []);
      expect(categories).toEqual([]);
    });
  });

  describe('getCategoryGroups', () => {
    it('gets groups for categories', () => {
      const groups = getCategoryGroups(testDatabase, ['emollient_alcohols']);
      expect(groups).toEqual(['alcohols']);
    });

    it('returns unique groups', () => {
      const groups = getCategoryGroups(testDatabase, [
        'emollient_alcohols',
        'drying_alcohols',
      ]);
      expect(groups).toEqual(['alcohols']);
    });

    it('handles unknown categories', () => {
      const groups = getCategoryGroups(testDatabase, ['unknown_category']);
      expect(groups).toEqual([]);
    });

    it('returns empty array for empty input', () => {
      const groups = getCategoryGroups(testDatabase, []);
      expect(groups).toEqual([]);
    });
  });
});
