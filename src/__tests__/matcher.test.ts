import { createMatcher } from '../utils/matcher';
import { testIngredients } from './data/testIngredients';
import { testCategories } from './data/testCategories';
import { AnalyzerConfig } from '../types';

describe('Ingredient Matcher', () => {
  const config: AnalyzerConfig = {
    database: {
      ingredients: testIngredients,
      categories: testCategories
    },
    fuzzyMatchThreshold: 0.3
  };

  const matcher = createMatcher(config);

  describe('exact matching', () => {
    test('matches exact ingredient names', () => {
      const result = matcher('Cetyl Alcohol');
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

    test('matches ingredient synonyms', () => {
      const result = matcher('SLES');
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

    test('is case insensitive', () => {
      const result = matcher('CETYL ALCOHOL');
      expect(result.matched).toBe(true);
      expect(result.categories).toContain('fatty alcohol');
    });
  });

  describe('fuzzy matching', () => {
    test('matches common misspellings', () => {
      const result = matcher('Cetearil Alcohol');
      expect(result).toEqual({
        name: 'Cetearil Alcohol',
        normalized: 'cetearil alcohol',
        matched: true,
        details: expect.objectContaining({
          name: 'Cetyl Alcohol'
        }),
        categories: ['fatty alcohol', 'emollient'],
        fuzzyMatch: true,
        confidence: expect.any(Number)
      });
    });

    test('does not match when confidence is too low', () => {
      const result = matcher('Completely Different Thing');
      expect(result).toEqual({
        name: 'Completely Different Thing',
        normalized: 'completely different thing',
        matched: false
      });
    });
  });

  describe('special cases', () => {
    test('handles empty input', () => {
      const result = matcher('');
      expect(result).toEqual({
        name: '',
        normalized: '',
        matched: false
      });
    });

    test('handles whitespace', () => {
      const result = matcher('  Cetyl   Alcohol  ');
      expect(result.matched).toBe(true);
      expect(result.categories).toContain('fatty alcohol');
    });
  });
});
