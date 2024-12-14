import { describe, it, expect } from 'vitest';
import { findIngredient, getIngredientCategories, getCategoryGroups } from '../../src/utils/databaseUtils';
import { testDatabase } from '../fixtures/testDatabase';

describe('Database Utils Unit Tests', () => {
  describe('findIngredient', () => {
    it('should find ingredient by exact name', () => {
      const ingredient = findIngredient(testDatabase, 'cetyl alcohol');
      expect(ingredient?.id).toBe('cetyl_alcohol');
    });

    it('should find ingredient by synonym', () => {
      const ingredient = findIngredient(testDatabase, 'hexadecan-1-ol');
      expect(ingredient?.id).toBe('cetyl_alcohol');
    });

    it('should return undefined for unknown ingredient', () => {
      const ingredient = findIngredient(testDatabase, 'unknown ingredient');
      expect(ingredient).toBeUndefined();
    });

    it('should be case insensitive', () => {
      const ingredient = findIngredient(testDatabase, 'CETYL ALCOHOL');
      expect(ingredient?.id).toBe('cetyl_alcohol');
    });
  });

  describe('getIngredientCategories', () => {
    it('should get categories for single ingredient', () => {
      const categories = getIngredientCategories(testDatabase, 'emollient_alcohol');
      expect(categories).toEqual(['emollient_alcohol']);
    });

    it('should handle unknown categories', () => {
      const categories = getIngredientCategories(testDatabase, 'unknown_category');
      expect(categories).toEqual([]);
    });

    it('should return empty array for empty input', () => {
      const categories = getIngredientCategories(testDatabase, []);
      expect(categories).toEqual([]);
    });
  });

  describe('getCategoryGroups', () => {
    it('should get groups for categories', () => {
      const groups = getCategoryGroups(testDatabase, ['emollient_alcohol']);
      expect(groups).toEqual(['alcohols']);
    });

    it('should handle unknown categories', () => {
      const groups = getCategoryGroups(testDatabase, ['unknown_category']);
      expect(groups).toEqual([]);
    });

    it('should return empty array for empty input', () => {
      const groups = getCategoryGroups(testDatabase, []);
      expect(groups).toEqual([]);
    });
  });
});
