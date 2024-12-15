import { describe, it, expect } from 'vitest';

import {
  normalizer,
  isValidIngredient,
  isValidIngredientList,
  normalizeIngredient,
  processCommaParentheses,
} from '../src/utils/normalizer';

describe('Normalizer', () => {
  describe('isValidIngredient', () => {
    it('should validate ingredient length', () => {
      expect(isValidIngredient('')).toBe(false);
      expect(isValidIngredient('   ')).toBe(false);
      expect(isValidIngredient('a'.repeat(151))).toBe(false);
      expect(isValidIngredient('Water')).toBe(true);
    });
  });

  describe('isValidIngredientList', () => {
    it('should reject URLs', () => {
      expect(isValidIngredientList('http://example.com')).toBe(false);
      expect(isValidIngredientList('https://test.com')).toBe(false);
      expect(isValidIngredientList('www.example.com')).toBe(false);
      expect(isValidIngredientList('//localhost:3000')).toBe(false);
    });

    it('should validate list content', () => {
      expect(isValidIngredientList('')).toBe(false);
      expect(isValidIngredientList('   ')).toBe(false);
      expect(isValidIngredientList('Water, Glycerin')).toBe(true);
    });
  });

  describe('normalizeIngredient', () => {
    it('should normalize ingredient', () => {
      expect(normalizeIngredient('  Water  ')).toBe('water');
      expect(normalizeIngredient('Water*')).toBe('water');
      expect(normalizeIngredient('Water.')).toBe('water');
      expect(normalizeIngredient('Water  Extract')).toBe('water extract');
    });
  });


  describe('processCommaParentheses', () => {
    it('should handle ingredients with commas in parentheses', () => {
      expect(processCommaParentheses('Water (h2o, aqua)')).toBe(
        'Water, h2o, aqua',
      );
      expect(processCommaParentheses('Complex (a, b) (c, d)')).toBe(
        'Complex, a, b, c, d',
      );
      expect(processCommaParentheses('No commas (test)')).toBe(
        'No commas (test)',
      );
    });

    it('should handle multiple sets of parentheses with commas', () => {
      expect(processCommaParentheses('Citrus Oils (Orange, Lemon), Vitamin E (Tocopherol, Tocopheryl Acetate)')).toEqual('Citrus Oils, Vitamin E, Orange, Lemon, Tocopherol, Tocopheryl Acetate');
    });
  });




  describe('normalizer (integration)', () => {
    it('should normalize basic ingredient lists', () => {
      const input = 'Water, Glycerin, Sodium Lauryl Sulfate';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'water',
        'glycerin',
        'sodium lauryl sulfate',
      ]);
    });

    it('should handle parentheses in ingredients', () => {
      const input =
        'Water (Aqua), Aloe Barbadensis (Aloe Vera) Leaf Juice, SD Alcohol 40-B (Alcohol Denat.), Natural Fragrance (Strawberry, Apple)';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'water aqua',
        'aloe barbadensis aloe vera leaf juice',
        'sd alcohol 40-b alcohol denat',
        'natural fragrance',
        'strawberry',
        'apple',
      ]);
    });

    it('should handle special characters and punctuation', () => {
      const input = 'Vitamin B5*, Aloe Vera., Citrus Extract*, Witch Hazel...';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'vitamin b5',
        'aloe vera',
        'citrus extract',
        'witch hazel',
      ]);
    });

    it('should handle different separators', () => {
      const input = 'Water | Glycerin & Aloe and Citric Acid';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'water',
        'glycerin',
        'aloe',
        'citric acid',
      ]);
    });

    it('should handle line breaks and excess spaces', () => {
      const input = 'Water,\nGlycerin,   Aloe\r\nCitric    Acid';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'water',
        'glycerin',
        'aloe',
        'citric acid',
      ]);
    });

    it('should filter out invalid ingredients', () => {
      const input = 'Water, , , Glycerin,    , Aloe';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual(['water', 'glycerin', 'aloe']);
    });

    it('should handle special characters and numbers', () => {
      const input = 'Water, C12-15 Alkyl Benzoate, Vitamin B5, pH Adjuster';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'water',
        'c12-15 alkyl benzoate',
        'vitamin b5',
        'ph adjuster',
      ]);
    });
  });
});
