import { describe, it, expect } from 'vitest';

import { findIngredient, getIngredientCategories, getCategoryGroups } from '../../src/utils/databaseUtils';
import { testDatabase } from '../fixtures/testDatabase';
import { mockMainDatabase, mockFallbackDatabase } from '../fixtures/fallbackDatabase';

describe('Database Utils Tests', () => {
  describe('Basic Database Operations', () => {
    describe('findIngredient with single database', () => {
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

  describe('Fallback Database Operations', () => {
    describe('findIngredient with fallback', () => {
      it('finds ingredient in main database', () => {
        const result = findIngredient(mockMainDatabase, 'Jojoba Oil', mockFallbackDatabase);
        expect(result).toBeDefined();
        expect(result?.id).toBe('jojoba_oil');
      });

      it('finds ingredient in main database using synonym', () => {
        const result = findIngredient(mockMainDatabase, 'simmondsia chinensis seed oil', mockFallbackDatabase);
        expect(result).toBeDefined();
        expect(result?.id).toBe('jojoba_oil');
      });

      it('finds ingredient in fallback database when not in main', () => {
        const result = findIngredient(mockMainDatabase, 'cone', mockFallbackDatabase);
        expect(result).toBeDefined();
        expect(result?.id).toBe('unknown_non_water_soluble_silicones');
      });

      it('finds ingredient in fallback database using exact name', () => {
        const result = findIngredient(mockMainDatabase, 'Unknown Non-Water Soluble Silicones', mockFallbackDatabase);
        expect(result).toBeDefined();
        expect(result?.id).toBe('unknown_non_water_soluble_silicones');
      });

      it('finds water soluble silicones in fallback database', () => {
        const result = findIngredient(mockMainDatabase, 'peg', mockFallbackDatabase);
        expect(result).toBeDefined();
        expect(result?.id).toBe('unknown_water_soluble_silicones');
      });

      it('finds sulfates in fallback database', () => {
        const result = findIngredient(mockMainDatabase, 'sulfate', mockFallbackDatabase);
        expect(result).toBeDefined();
        expect(result?.id).toBe('unknown_sulfates');
      });

      it('matches various silicone synonyms from fallback', () => {
        const synonyms = ['silane', 'siloxane', 'dimethcione', 'botanisil', 'silicon', 'silylate', 'silsesquioxane', 'siloxysilicate', 'microsil'];
        synonyms.forEach(synonym => {
          const result = findIngredient(mockMainDatabase, synonym, mockFallbackDatabase);
          expect(result).toBeDefined();
          expect(result?.id).toBe('unknown_non_water_soluble_silicones');
        });
      });

      it('returns undefined when ingredient not found in either database', () => {
        const result = findIngredient(mockMainDatabase, 'nonexistent ingredient', mockFallbackDatabase);
        expect(result).toBeUndefined();
      });

      it('returns undefined when ingredient not found and no fallback provided', () => {
        const result = findIngredient(mockMainDatabase, 'cone');
        expect(result).toBeUndefined();
      });

      it('is case insensitive for both databases', () => {
        const mainResult = findIngredient(mockMainDatabase, 'JOJOBA OIL', mockFallbackDatabase);
        expect(mainResult?.id).toBe('jojoba_oil');

        const fallbackResult = findIngredient(mockMainDatabase, 'CONE', mockFallbackDatabase);
        expect(fallbackResult?.id).toBe('unknown_non_water_soluble_silicones');

        const fallbackResult2 = findIngredient(mockMainDatabase, 'PEG', mockFallbackDatabase);
        expect(fallbackResult2?.id).toBe('unknown_water_soluble_silicones');
      });
    });
  });
});
