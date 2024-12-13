import { matchIngredient } from '../src/utils/matcher';

import { testCategories } from './data/testCategories';
import { alcohols } from './data/testIngredients/alcohols';

describe('matchIngredient', () => {
  const testDatabase = {
    ingredients: alcohols,
    categories: testCategories,
  };

  test('"alcohol denat." should match denatured alcohol', () => {
    const match = matchIngredient('alcohol denat.', testDatabase);

    expect(match.matchDetails?.matched).toBe(true);

  });

  test('should return basic info for no matches', () => {
    const match = matchIngredient('nonexistent ingredient', testDatabase);

    expect(match).toEqual({
      uuid: expect.any(String),
      name: 'nonexistent ingredient',
      normalized: 'nonexistent ingredient',
      matchDetails: {
        confidence: 0,
        matched: false,
        flagged: false,
      },
    });
  });

  test('handle ingredient with parentheses', () => {
    const match = matchIngredient(
      'denatured alcohol (sd alcohol 40)',
      testDatabase,
    );

    expect(match.matchDetails?.matched).toBe(true);
  });

  test('should include debug info when debug option is set', () => {
    const match = matchIngredient('alcohol', testDatabase, { debug: true });

    expect(match.debug).toBeDefined();
    expect(Array.isArray(match.debug?.allMatches)).toBe(true);
    expect(match.debug?.allMatches.length).toBeGreaterThan(0);
  });

  test('should generate unique IDs for matches', () => {
    const match1 = matchIngredient('alcohol', testDatabase);
    const match2 = matchIngredient('alcohol', testDatabase);
    const noMatch = matchIngredient('nonexistent ingredient', testDatabase);

    // Verify IDs exist
    expect(match1.uuid).toBeDefined();
    expect(match2.uuid).toBeDefined();
    expect(noMatch.uuid).toBeDefined();

    // Verify IDs are unique
    expect(match1.uuid).not.toEqual(match2.uuid);
  });

  test('should find matches for misspelled ingredients', () => {
    const match = matchIngredient('cetil alkohol', testDatabase);

    expect(match.matchDetails?.matched).toBe(true);
    expect(match.details?.name).toBe('Cetyl Alcohol');
  });

  test('should find matches for misspelled ingredients and synonyms', () => {
    const nameMatch = matchIngredient('cetil alkohol', testDatabase);
    expect(nameMatch.matchDetails?.matched).toBe(true);
    expect(nameMatch.details?.name).toBe('Cetyl Alcohol');

    // Test fuzzy match on synonym
    const synonymMatch = matchIngredient('cetearil alkohol', testDatabase);
    expect(synonymMatch.matchDetails?.matched).toBe(true);
    expect(synonymMatch.details?.name).toBe('Cetyl Alcohol');
  });

  test('should populate details from matched ingredient', () => {
    const match = matchIngredient('alcohol denat.', testDatabase);

    expect(match.details).toBeDefined();
    // Verify specific fields from the matched ingredient
    expect(match.details?.name).toBe('Denatured Alcohol');
    expect(match.details?.category).toEqual(['drying_alcohol']);
    expect(match.details?.description).toBeDefined();
  });

  test('should not include details when no match is found', () => {
    const match = matchIngredient('nonexistent ingredient', testDatabase);

    expect(match.details).toBeUndefined();
  });

  test('should include all ingredient fields in details when matched', () => {
    const match = matchIngredient('cetyl alcohol', testDatabase);

    expect(match.details).toMatchObject({
      name: 'Cetyl Alcohol',
      category: expect.any(Array),
      description: expect.any(String),
      id: expect.any(String),
      synonyms: expect.any(Array),
    });
  });
});
