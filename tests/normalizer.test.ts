import { describe, it, expect } from 'vitest';

import { normalizer } from '../src/utils/normalizer';

describe('Normalizer Unit Tests', () => {
  describe('Input Validation', () => {
    it('should reject URLs', () => {
      const urlInputs = [
        'http://example.com',
        'https://test.com/ingredients',
        'www.ingredients.com',
        '//localhost:3000',
      ];

      urlInputs.forEach((url) => {
        const result = normalizer(url);
        expect(result.isValid).toBe(false);
        expect(result.ingredients).toEqual([]);
      });
    });

    it('should handle empty or invalid input', () => {
      const invalidInputs = ['', ' ', '   '];

      invalidInputs.forEach((input) => {
        const result = normalizer(input);
        expect(result.isValid).toBe(false);
        expect(result.ingredients).toEqual([]);
      });
    });

    it('should reject ingredients longer than 150 characters', () => {
      const longIngredient = 'a'.repeat(151);
      const input = `Water, ${longIngredient}, Glycerin`;
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual(['water', 'glycerin']);
    });
  });

  describe('Text Normalization', () => {
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
      const input = 'Water (Aqua), Aloe Barbadensis (Aloe Vera) Leaf Juice';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'water',
        'aloe barbadensis leaf juice',
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
