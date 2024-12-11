import {
  regexMatch,
  findExactMatch,
  findPartialMatches,
  fuzzyMatch,
} from '../src/utils/matchmethods';

import { testIngredients } from './data/testIngredients';

describe('regexMatch', () => {
  test('should match basic regex patterns', () => {
    const patterns = ['^test\\d+$'];
    expect(regexMatch('test123', patterns)).toBe(true);
    expect(regexMatch('test', patterns)).toBe(false);
  });

  test('should be case insensitive', () => {
    const patterns = ['test'];
    expect(regexMatch('TEST', patterns)).toBe(true);
    expect(regexMatch('Test', patterns)).toBe(true);
    expect(regexMatch('test', patterns)).toBe(true);
  });

  test('should match if any pattern matches', () => {
    const patterns = ['^test\\d+$', '^example\\d+$'];
    expect(regexMatch('test123', patterns)).toBe(true);
    expect(regexMatch('example456', patterns)).toBe(true);
    expect(regexMatch('neither', patterns)).toBe(false);
  });

  test('should handle invalid regex patterns', () => {
    const patterns = ['[invalid', 'test']; // First pattern is invalid
    expect(regexMatch('test', patterns)).toBe(true); // Should still match second pattern
  });

  test('should handle empty or undefined patterns', () => {
    expect(regexMatch('test', [])).toBe(false);
    expect(regexMatch('test', undefined)).toBe(false);
  });
});

describe('findExactMatch', () => {
  test('should match exact ingredient names', () => {
    expect(findExactMatch('cetyl alcohol', 'cetyl alcohol')).toEqual({
      matched: true,
      matchedOn: ['cetyl alcohol'],
    });
    expect(findExactMatch('test', 'different')).toEqual({
      matched: false,
    });
  });

  test('should be case insensitive', () => {
    expect(findExactMatch('CETYL ALCOHOL', 'cetyl alcohol')).toEqual({
      matched: true,
      matchedOn: ['cetyl alcohol'],
    });
  });

  test('should match against synonyms', () => {
    const synonyms = ['SLES', 'sodium lauryl ether sulfate'];
    expect(findExactMatch('SLES', 'sodium laureth sulfate', synonyms)).toEqual({
      matched: true,
      matchedOn: ['SLES'],
    });
  });
});

describe('findPartialMatches', () => {
  test('should match partial ingredient names', () => {
    expect(findPartialMatches('sodium laureth sulfate', 'sulfate')).toEqual({
      matched: true,
      matchedOn: 'sulfate',
    });
    expect(findPartialMatches('water', 'alcohol')).toEqual({
      matched: false,
    });
  });

  test('should match configured partial patterns', () => {
    const partials = ['sd alcohol', 'alcohol denat'];
    expect(
      findPartialMatches('sd alcohol 40', 'denatured alcohol', partials),
    ).toEqual({
      matched: true,
      matchedOn: 'sd alcohol',
    });
  });

  test('should be case insensitive', () => {
    expect(findPartialMatches('SODIUM LAURETH SULFATE', 'sulfate')).toEqual({
      matched: true,
      matchedOn: 'sulfate',
    });
  });
});

describe('fuzzyMatch', () => {


  test('should match similar spellings', () => {
    const matches = fuzzyMatch('cetyl alcohl', testIngredients);
    expect(matches).toHaveLength(1);
    expect(matches[0].ingredient.name).toBe('Cetyl Alcohol');
  });

  test('should not match ingredients without fuzzyMatch config', () => {
    const ingredients = [
      {
        name: 'cetyl alcohol',
        category: ['fatty alcohol'],
        // No matchConfig
      },
    ];
    const matches = fuzzyMatch('cetyl alcohl', ingredients);
    expect(matches).toHaveLength(0);
  });

  test('should match against name and synonyms', () => {
    const matches = fuzzyMatch('slez', testIngredients);
   // expect(matches).toHaveLength(1);
    expect(matches[0].matchedOn).toBe('SLES');
  });

  test('should not match completely different ingredients', () => {
    const matches = fuzzyMatch('completely different', testIngredients);
    expect(matches).toHaveLength(0);
  });

  test('when matchedField is undefined, use name', () => {
    const matches = fuzzyMatch('cetyl alcohl', testIngredients);
    expect(matches[0].matchedOn).toBe('Cetyl Alcohol');
  });

  test('should handle matches on both name and synonyms with correct matchedOn value', () => {
    // Test matching on name (fallback case with no matches array)
    const nameMatches = fuzzyMatch('cetyl alcohl', testIngredients);
    expect(nameMatches).toHaveLength(1);
    expect(nameMatches[0]).toEqual({
      ingredient: testIngredients[0],
      matchedOn: 'Cetyl Alcohol'  // falls back to name because matches array is undefined
    });

    // Test matching on synonym (direct match case)
    const synonymMatches = fuzzyMatch('SLES', testIngredients);
    expect(synonymMatches).toHaveLength(1);
    expect(synonymMatches[0].ingredient.name).toBe('Sodium Laureth Sulfate');
    expect(synonymMatches[0].matchedOn).toBe('SLES');
  });
});
