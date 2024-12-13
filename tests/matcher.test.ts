import { matchIngredient, createMatch } from '../src/utils/matcher';

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
    expect(match.matchDetails?.confidence).toBe(1);
    expect(match.matchDetails?.matchedOn).toContain('alcohol denat');
  });

  test('should return basic info for no matches', () => {
    const match = matchIngredient('nonexistent ingredient', testDatabase);

    expect(match).toEqual({
      id: expect.any(String),
      name: 'nonexistent ingredient',
      normalized: 'nonexistent ingredient',
    });
  });

  test('handle ingredient with parentheses', () => {
    const match = matchIngredient(
      'denatured alcohol (sd alcohol 40)',
      testDatabase,
    );

    expect(match.matchDetails?.matched).toBe(true);
    expect(match.matchDetails?.matchedOn).toEqual(['denatured alcohol']);
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
    expect(match1.id).toBeDefined();
    expect(match2.id).toBeDefined();
    expect(noMatch.id).toBeDefined();

    // Verify IDs are unique
    expect(match1.id).not.toEqual(match2.id);
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
    expect(match.details?.category).toEqual(['drying alcohol']);
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

describe('createMatch', () => {
  test('should create basic match with required fields', () => {
    const match = createMatch({
      name: 'test ingredient',
      normalized: 'test ingredient',
    });

    expect(match).toEqual({
      id: expect.any(String),
      name: 'test ingredient',
      normalized: 'test ingredient',
    });
  });

  test('should include match details when provided', () => {
    const match = createMatch({
      name: 'test ingredient',
      normalized: 'test ingredient',
      matchDetails: {
        matched: true,
        confidence: 0.8,
        matchedOn: ['test ingredient'],
      },
    });

    expect(match.matchDetails).toEqual({
      matched: true,
      confidence: 0.8,
      matchedOn: ['test ingredient'],
    });
  });

  test('should include additional details when provided', () => {
    const match = createMatch({
      name: 'test ingredient',
      normalized: 'test ingredient',
      details: {
        name: 'Test Ingredient',
        id: 'test-ingredient',
        category: ['category1'],
        description: 'test description',
      },
    });

    expect(match.details).toEqual({
      name: 'Test Ingredient',
      category: ['category1'],
      description: 'test description',
      id: 'test-ingredient',
    });
  });
});
