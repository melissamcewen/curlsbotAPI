import { describe, it, expect } from 'vitest';

import {
  normalizer,
  isValidIngredient,
  isValidIngredientList,
  normalizeIngredient,
  processCommaParentheses,
} from '../../src/utils/normalizer';

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

    it('should handle URLs within text', () => {
      expect(
        isValidIngredientList('Check http://example.com for ingredients'),
      ).toBe(false);
      expect(
        isValidIngredientList('From www.example.com: Water, Glycerin'),
      ).toBe(false);
      expect(isValidIngredientList('Source: //example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidIngredientList('\n\nWater')).toBe(true);
      expect(isValidIngredientList('   Water   ')).toBe(true);
      expect(isValidIngredientList('httpx://not-a-url')).toBe(false);
      expect(isValidIngredientList('wwwx.not-a-url')).toBe(true);
    });

    it('should reject product names', () => {
      expect(isValidIngredientList('loreal shampoo')).toBe(false);
      expect(isValidIngredientList('accure conditioner')).toBe(false);

    });


  });

  describe('normalizeIngredient', () => {
    it('should normalize ingredient', () => {
      expect(normalizeIngredient('  Water  ')).toBe('water');
      expect(normalizeIngredient('Water*')).toBe('water');
      expect(normalizeIngredient('Water.')).toBe('water');
      expect(normalizeIngredient('Water  Extract')).toBe('water extract');
      expect(normalizeIngredient('Aqua/water/eau')).toBe('aqua water eau');
    });
  });

  describe('processCommaParentheses', () => {
    it('should handle ingredients with commas in parentheses', () => {
      expect(processCommaParentheses('Water (h2o, aqua)')).toBe(
        'Water , h2o, aqua',
      );
      expect(processCommaParentheses('Complex (a, b) (c, d)')).toBe(
        'Complex , a, b , c, d',
      );
      expect(processCommaParentheses('No commas (test)')).toBe(
        'No commas (test)',
      );
    });

    it('should handle multiple sets of parentheses with commas', () => {
      expect(
        processCommaParentheses(
          'Citrus Oils (Orange, Lemon), Vitamin E (Tocopherol, Tocopheryl Acetate)',
        ),
      ).toBe(
        'Citrus Oils , Orange, Lemon, Vitamin E , Tocopherol, Tocopheryl Acetate',
      );
    });

    it('should handle empty parentheses and spaces correctly', () => {
      // Empty parentheses should be left as is
      expect(processCommaParentheses('Test (), Other (  )')).toBe(
        'Test , Other ',
      );
      // Only process parentheses with commas
      expect(processCommaParentheses('Multiple   Spaces   (a,b)')).toBe(
        'Multiple   Spaces   , a, b',
      );
      // Empty content with comma should be removed
      expect(processCommaParentheses('Test (,)')).toBe('Test , ');
    });

    it('should handle nested and unmatched parentheses', () => {
      // Nested parentheses should be unnested
      expect(processCommaParentheses('Test (a, (b, c))')).toBe(
        'Test , a, b, c',
      );
      // Unmatched parentheses should be left as is
      expect(processCommaParentheses('Test (a, b')).toBe('Test (a, b');
      expect(processCommaParentheses('Test ) (a, b)')).toBe('Test ) , a, b');
    });
  });

  describe('normalizer (integration)', () => {
    it('should return invalid result for URLs', () => {
      const inputs = [
        'http://example.com',
        'https://test.com',
        'www.example.com',
        '//localhost:3000',
      ];

      inputs.forEach((input) => {
        const result = normalizer(input);
        expect(result.isValid).toBe(false);
        expect(result.ingredients).toEqual([]);
      });
    });

    it('should return invalid result for empty or whitespace input', () => {
      const inputs = ['', '   ', '\n\n', '\t'];

      inputs.forEach((input) => {
        const result = normalizer(input);
        expect(result.isValid).toBe(false);
        expect(result.ingredients).toEqual([]);
      });
    });

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

    it('should normalize ingredients after validation', () => {
      const input = 'Water*, Glycerin@#$, Invalid@#$, SD Alcohol 40-B';
      const result = normalizer(input);

      expect(result.isValid).toBe(true);
      expect(result.ingredients).toEqual([
        'water',
        'glycerin',
        'invalid',
        'sd alcohol 40-b',
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

    it('should handle invalid input correctly', () => {
      const inputs = [
        'http://example.com/ingredients',
        'www.example.com/list',
        '//ingredients.com',
        '',
        '   ',
        '\n\n',
        '\t',
      ];

      inputs.forEach((input) => {
        const result = normalizer(input);
        expect(result).toEqual({
          ingredients: [],
          isValid: false,
        });
      });
    });

    it('should return invalid when no valid ingredients exist', () => {
      const inputs = [
        'a'.repeat(151),  // Too long
        '    ',           // Only whitespace
        '*, @, #',        // Only special characters
        '(), (), ()',     // Only empty parentheses
      ];

      inputs.forEach((input) => {
        const result = normalizer(input);
        expect(result).toEqual({
          ingredients: [],
          isValid: false,
        });
      });
    });
  });
});
