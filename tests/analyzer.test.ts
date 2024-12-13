import { Analyzer, AnalyzerError, createEmptyResult } from '../src/utils/analyzer';


import { analyzerFixtures } from './fixtures/analyzer.fixtures';

describe('Analyzer', () => {
  const { testCases, createAnalyzer } = analyzerFixtures;

  let analyzer: Analyzer;

  beforeEach(() => {
    analyzer = createAnalyzer();
  });

  describe('Basic ingredient analysis', () => {
    test('should analyze a basic ingredient list', () => {
      const { input, expectedMatches, expectedCategories, expectedIngredients } = testCases.basicList;
      const result = analyzer.analyze(input);

      expect(result.matches).toHaveLength(expectedMatches);

      expectedCategories.forEach(category => {
        expect(result.categories).toContain(category);
      });

      expectedIngredients.forEach(ingredient => {
        expect(result.matches.some(match => match.normalized === ingredient)).toBe(true);
      });

      // Test specific match details
      const slsMatch = result.matches.find(match => match.normalized === 'sodium lauryl sulfate');
      expect(slsMatch?.details?.name).toBe('Sodium Lauryl Sulfate');
      expect(slsMatch?.details?.description).toContain('A strong cleansing agent');
    });
  });

  describe('Error handling', () => {
    test.each([
      ['empty string', testCases.invalidInputs.empty],
      ['null', testCases.invalidInputs.null],
      ['undefined', testCases.invalidInputs.undefined],
      ['number', testCases.invalidInputs.number],
      ['object', testCases.invalidInputs.object],
    ])('should throw AnalyzerError for %s input', (_, input) => {
      // @ts-expect-error Testing invalid inputs
      expect(() => analyzer.analyze(input)).toThrow(AnalyzerError);
    });

    test('should handle invalid ingredient list format', () => {
      const result = analyzer.analyze(testCases.invalidInputs.invalidFormat);
      expect(result).toEqual(createEmptyResult());
    });
  });

  describe('Database queries', () => {
    test('should return all categories', () => {
      const categories = analyzer.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('fatty_alcohol');
      expect(categories).toContain('solvent_alcohol');

      // Check for duplicates
      expect(categories.length).toBe(new Set(categories).size);
    });

    test('should return all ingredients', () => {
      const ingredients = analyzer.getIngredients();

      expect(Array.isArray(ingredients)).toBe(true);
      expect(ingredients.length).toBeGreaterThan(0);
      expect(ingredients).toContain('cetyl_alcohol');
      expect(ingredients).toContain('benzyl_alcohol');

      // Check for duplicates
      expect(ingredients.length).toBe(new Set(ingredients).size);
    });
  });

  describe('Flagging', () => {
    test('should flag ingredients by id', () => {
      const flaggedAnalyzer = createAnalyzer({
        flaggedIngredients: ['sodium_lauryl_sulfate'],
      });

      const result = flaggedAnalyzer.analyze(testCases.basicList.input);

      expect(result.flags?.ingredients).toContain('sodium_lauryl_sulfate');
      expect(result.matches.find(m =>
        m.normalized === 'sodium lauryl sulfate'
      )?.matchDetails?.flagged).toBe(true);
    });

    test('should flag ingredients by category', () => {
      const flaggedAnalyzer = createAnalyzer({
        flaggedCategories: ['solvent_alcohol'],
      });

      const result = flaggedAnalyzer.analyze('Water, Benzyl Alcohol');

      expect(result.flags?.categories).toContain('solvent_alcohol');
      expect(result.matches.find(m =>
        m.normalized === 'benzyl alcohol'
      )?.matchDetails?.flagged).toBe(true);
    });
  });
});
