import { describe, it, expect } from 'vitest';
import { findIngredient } from '../../src/utils/databaseUtils';
import { mockMainDatabase, mockFallbackDatabase } from '../fixtures/fallbackDatabase';

describe('findIngredient', () => {
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
