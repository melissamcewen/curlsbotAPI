import { matchIngredient } from '../utils/matcher';

describe('matchIngredient', () => {
  test('should find exact matches', () => {
    const result = matchIngredient('Cetyl Alcohol');
    expect(result).toEqual({
      name: 'Cetyl Alcohol',
      normalized: 'cetyl alcohol',
      matched: true,
      details: expect.objectContaining({
        name: 'Cetyl Alcohol',
        category: ['fatty alcohol', 'emollient']
      }),
      categories: ['fatty alcohol', 'emollient']
    });
  });

  test('should match synonyms exactly', () => {
    const result = matchIngredient('Cetostearyl Alcohol');
    expect(result).toEqual({
      name: 'Cetostearyl Alcohol',
      normalized: 'cetostearyl alcohol',
      matched: true,
      details: expect.objectContaining({
        name: 'Cetearyl Alcohol',
        category: ['fatty alcohol', 'emollient']
      }),
      categories: ['fatty alcohol', 'emollient'],
      matchedSynonym: 'cetostearyl alcohol'
    });
  });

  test('should match common abbreviations', () => {
    const result = matchIngredient('SLES');
    expect(result).toEqual({
      name: 'SLES',
      normalized: 'sles',
      matched: true,
      details: expect.objectContaining({
        name: 'Sodium Laureth Sulfate',
        category: ['sulfate', 'harsh cleanser']
      }),
      categories: ['sulfate', 'harsh cleanser'],
      matchedSynonym: 'sles'
    });
  });

  test('should find fuzzy matches with common misspellings', () => {
    const result = matchIngredient('Cetearil Alcohol');
    expect(result).toEqual({
      name: 'Cetearil Alcohol',
      normalized: 'cetearil alcohol',
      matched: true,
      details: expect.objectContaining({
        name: 'Cetearyl Alcohol',
        category: ['fatty alcohol', 'emollient']
      }),
      categories: ['fatty alcohol', 'emollient'],
      fuzzyMatch: true,
      confidence: expect.any(Number)
    });
  });

  test('should not match when confidence is too low', () => {
    const result = matchIngredient('Completely Different Ingredient');
    expect(result).toEqual({
      name: 'Completely Different Ingredient',
      normalized: 'completely different ingredient',
      matched: false
    });
  });

  test('should handle case insensitivity', () => {
    const result = matchIngredient('CETYL ALCOHOL');
    expect(result).toEqual({
      name: 'CETYL ALCOHOL',
      normalized: 'cetyl alcohol',
      matched: true,
      details: expect.objectContaining({
        name: 'Cetyl Alcohol',
        category: ['fatty alcohol', 'emollient']
      }),
      categories: ['fatty alcohol', 'emollient']
    });
  });
});