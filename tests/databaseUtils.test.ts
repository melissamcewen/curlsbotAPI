import { describe, it, expect } from 'vitest';

import { findIngredient, getIngredientCategories, getCategoryGroups } from '../src/utils/databaseUtils';

import { testDatabase } from './fixtures/testDatabase';
import { mockFallbackDatabase } from './fixtures/fallbackDatabase';

describe('Database Utils', () => {
  describe('findIngredient', () => {
    it('finds ingredient by exact name', () => {
      const ingredient = findIngredient(testDatabase, 'cetyl alcohol');
      expect(ingredient?.id).toBe('cetyl_alcohol');
    });

    it('finds ingredient by synonym', () => {
      const ingredient = findIngredient(testDatabase, 'hexadecan-1-ol');
      expect(ingredient?.id).toBe('cetyl_alcohol');
    });

    it('is case insensitive', () => {
      const ingredient = findIngredient(testDatabase, 'CETYL ALCOHOL');
      expect(ingredient?.id).toBe('cetyl_alcohol');
    });

    it('returns undefined for unknown ingredient', () => {
      const ingredient = findIngredient(testDatabase, 'unknown ingredient');
      expect(ingredient).toBeUndefined();
    });

    describe('with fallback', () => {
      it('finds in main database first', () => {
        const result = findIngredient(testDatabase, 'Cetyl Alcohol', mockFallbackDatabase);
        expect(result?.id).toBe('cetyl_alcohol');
      });

      it('finds in fallback when not in main', () => {
        const result = findIngredient(testDatabase, 'cone', mockFallbackDatabase);
        expect(result?.id).toBe('unknown_non_water_soluble_silicones');
      });

      it('returns undefined when not in either', () => {
        const result = findIngredient(testDatabase, 'nonexistent', mockFallbackDatabase);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('getIngredientCategories', () => {
    it('gets categories for ingredient', () => {
      const categories = getIngredientCategories(testDatabase, 'emollient_alcohol');
      expect(categories).toEqual(['emollient_alcohol']);
    });

    it('handles multiple categories', () => {
      const categories = getIngredientCategories(testDatabase, ['emollient_alcohol', 'drying_alcohol']);
      expect(categories).toEqual(['emollient_alcohol', 'drying_alcohol']);
    });

    it('handles unknown categories', () => {
      const categories = getIngredientCategories(testDatabase, 'unknown_category');
      expect(categories).toEqual([]);
    });

    it('returns empty array for empty input', () => {
      const categories = getIngredientCategories(testDatabase, []);
      expect(categories).toEqual([]);
    });
  });

  describe('getCategoryGroups', () => {
    it('gets groups for categories', () => {
      const groups = getCategoryGroups(testDatabase, ['emollient_alcohol']);
      expect(groups).toEqual(['alcohols']);
    });

    it('returns unique groups', () => {
      const groups = getCategoryGroups(testDatabase, ['emollient_alcohol', 'drying_alcohol']);
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
