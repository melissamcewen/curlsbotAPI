import { Analyzer } from '../utils/analyzer';
import { testIngredients, testCategories } from './data/testData';

describe('Analyzer', () => {
  const analyzer = new Analyzer({
    database: {
      ingredients: testIngredients,
      categories: testCategories
    }
  });

  describe('analyzeIngredients', () => {
    test('analyzes single ingredient correctly', () => {
      const results = analyzer.analyzeIngredients('Cetyl Alcohol');
      expect(results.matches[0].matched).toBe(true);
      expect(results.matches[0].categories).toContain('fatty alcohol');
      expect(results.categories).toContain('fatty alcohol');
    });

    test('analyzes multiple ingredients correctly', () => {
      const results = analyzer.analyzeIngredients('Cetyl Alcohol, Isopropyl Alcohol');
      expect(results.matches).toHaveLength(2);
      expect(results.categories).toContain('fatty alcohol');
      expect(results.categories).toContain('drying alcohol');
    });

    test('handles unknown ingredients', () => {
      const results = analyzer.analyzeIngredients('Unknown Ingredient');
      expect(results.matches[0].matched).toBe(false);
      expect(results.matches[0].name).toBe('Unknown Ingredient');
      expect(results.categories).toHaveLength(0);
    });

    test('handles empty input', () => {
      const results = analyzer.analyzeIngredients('');
      expect(results.matches).toHaveLength(0);
      expect(results.categories).toHaveLength(0);
    });

    test('handles whitespace and formatting', () => {
      const results = analyzer.analyzeIngredients('  Cetyl   Alcohol  ,  Isopropyl   Alcohol  ');
      expect(results.matches).toHaveLength(2);
      expect(results.matches[0].matched).toBe(true);
      expect(results.matches[1].matched).toBe(true);
    });
  });

  describe('findIngredientsByCategory', () => {
    test('finds ingredients by category', () => {
      const fattyAlcohols = analyzer.findIngredientsByCategory('fatty alcohol');
      expect(fattyAlcohols).toContain('Cetyl Alcohol');
      
      const dryingAlcohols = analyzer.findIngredientsByCategory('drying alcohol');
      expect(dryingAlcohols).toContain('Isopropyl Alcohol');
    });

    test('returns empty array for unknown category', () => {
      const results = analyzer.findIngredientsByCategory('non-existent category');
      expect(results).toEqual([]);
    });
  });

  describe('complex ingredient lists', () => {
    test('analyzes shampoo ingredients correctly', () => {
      const list = "Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Cetyl Alcohol";
      const results = analyzer.analyzeIngredients(list);
      
      expect(results.matches).toHaveLength(4);
      expect(results.categories).toContain('sulfate');
      expect(results.categories).toContain('gentle cleanser');
      expect(results.categories).toContain('fatty alcohol');
    });

    test('handles ingredient synonyms', () => {
      const list = "SLES, CAPB, Hexadecan-1-ol";
      const results = analyzer.analyzeIngredients(list);
      
      expect(results.matches[0].matchedSynonym).toBe('sles');
      expect(results.matches[1].matchedSynonym).toBe('capb');
      expect(results.matches[2].matchedSynonym).toBe('hexadecan-1-ol');
    });
  });
});