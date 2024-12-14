import { describe, it, expect } from 'vitest';
import { findIngredient, getIngredientCategories, getCategoryGroups } from '../../src/utils/databaseUtils';
import type { IngredientDatabase } from '../../src/types';

// Test database
const testDatabase: IngredientDatabase = {
  ingredients: {
    cetyl_alcohol: {
      id: 'cetyl_alcohol',
      name: 'Cetyl Alcohol',
      description: 'A fatty alcohol that acts as an emollient',
      categories: ['emollient_alcohol'],
      references: ['https://example.com/cetyl-alcohol'],
      synonyms: ['hexadecan-1-ol', '1-hexadecanol']
    }
  },
  categories: {
    emollient_alcohol: {
      id: 'emollient_alcohol',
      name: 'Emollient Alcohol',
      description: 'Alcohols that moisturize and condition',
      group: 'alcohols'
    }
  },
  groups: {
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
      description: 'Different types of alcohols used in hair care'
    }
  }
};

describe('database utils', () => {
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

    it('should get categories for multiple ingredients', () => {
      const categories = getIngredientCategories(testDatabase, ['emollient_alcohol']);
      expect(categories).toEqual(['emollient_alcohol']);
    });

    it('should handle unknown categories', () => {
      const categories = getIngredientCategories(testDatabase, 'unknown_category');
      expect(categories).toEqual([]);
    });

    it('should handle mix of known and unknown categories', () => {
      const categories = getIngredientCategories(testDatabase, ['emollient_alcohol', 'unknown_category']);
      expect(categories).toEqual(['emollient_alcohol']);
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

    it('should handle mix of known and unknown categories', () => {
      const groups = getCategoryGroups(testDatabase, ['emollient_alcohol', 'unknown_category']);
      expect(groups).toEqual(['alcohols']);
    });

    it('should return empty array for empty input', () => {
      const groups = getCategoryGroups(testDatabase, []);
      expect(groups).toEqual([]);
    });
  });
});
