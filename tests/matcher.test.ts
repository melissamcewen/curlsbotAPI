import { IngredientDatabase } from '../src/types';
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
    expect(match.matchDetails?.matchTypes).toContain('partialMatch');
    expect(match.matchDetails?.searchType).toBe('ingredient');
    expect(match.matchDetails?.confidence).toBe(0.7);
    expect(match.matchDetails?.matchedOn).toEqual(['alcohol denat']);
  });

  test('"alcohol" should match alcohol from categoryGroup', () => {
    const match = matchIngredient('alcohol', testDatabase, { debug: true });

    // Check debug info for all matches
    expect(match.debug?.allMatches.length).toBeGreaterThan(1);

    // Find category group match in debug info
    const categoryMatch = match.debug?.allMatches.find(
      (m) => m.matchDetails?.searchType === 'categoryGroup',
    );
    expect(categoryMatch).toBeDefined();
    expect(categoryMatch?.matchDetails?.matched).toBe(true);
    expect(categoryMatch?.matchDetails?.confidence).toBe(0.5);
    expect(categoryMatch?.categories).toEqual(['unknown Alcohols']);
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
    expect(match.matchDetails?.searchType).toBe('ingredient');
    expect(match.matchDetails?.matchedOn).toEqual(['Denatured Alcohol']);
  });

  test('should include debug info when debug option is set', () => {
    const match = matchIngredient('alcohol', testDatabase, { debug: true });

    expect(match.debug).toBeDefined();
    expect(Array.isArray(match.debug?.allMatches)).toBe(true);
    expect(match.debug?.allMatches.length).toBeGreaterThan(1);

    // First match should be exact ingredient match
    expect(match.debug?.allMatches[0].matchDetails?.searchType).toBe(
      'ingredient',
    );
    expect(match.debug?.allMatches[0].matchDetails?.confidence).toBe(1);

    // Should also have category group match
    const categoryMatch = match.debug?.allMatches.find(
      (m) => m.matchDetails?.searchType === 'categoryGroup',
    );
    expect(categoryMatch).toBeDefined();
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

  test('should find fuzzy matches for misspelled ingredients', () => {
    const match = matchIngredient('cetil alkohol', testDatabase);

    expect(match.matchDetails?.matched).toBe(true);
    expect(match.matchDetails?.matchTypes).toContain('fuzzyMatch');
    expect(match.matchDetails?.searchType).toBe('ingredient');
    expect(match.details?.name).toBe('Cetyl Alcohol');
  });

  test('should find fuzzy matches for misspelled ingredients and synonyms', () => {
    // Test fuzzy match on name
    const nameMatch = matchIngredient('cetil alkohol', testDatabase);
    expect(nameMatch.matchDetails?.matched).toBe(true);
    expect(nameMatch.matchDetails?.matchTypes).toContain('fuzzyMatch');
    expect(nameMatch.details?.name).toBe('Cetyl Alcohol');

    // Test fuzzy match on synonym
    const synonymMatch = matchIngredient('cetearil alkohol', testDatabase);
    expect(synonymMatch.matchDetails?.matched).toBe(true);
    expect(synonymMatch.matchDetails?.matchTypes).toContain('fuzzyMatch');
    expect(synonymMatch.details?.name).toBe('Cetyl Alcohol');
    expect(synonymMatch.matchDetails?.matchedOn).toContain('cetearyl alcohol');
  });

  test('should find exact category matches', () => {
    const match = matchIngredient('waxes', testDatabase);

    expect(match.matchDetails?.matched).toBe(true);
    expect(match.matchDetails?.matchTypes).toContain('exactMatch');
    expect(match.matchDetails?.searchType).toBe('category');
    expect(match.matchDetails?.confidence).toBe(0.8);
  });

  test('should only match categories with exactMatch in matchType', () => {
    const customTestDatabase = {
      ingredients: [],
      categories: [
        {
          name: 'Test Group',
          description: '',
          categories: [
            {
              name: 'With Exact Match',
              description: '',
              matchConfig: {
                matchType: ['exactMatch'],
                partials: [],
              },
            },
            {
              name: 'Without Exact Match',
              description: '',
              matchConfig: {
                matchType: ['partialMatch'],
                partials: [],
              },
            },
          ],
        },
      ],
    } as IngredientDatabase;

    // Should match category with exactMatch
    const matchResult = matchIngredient('with exact match', customTestDatabase);
    expect(matchResult.matchDetails?.matched).toBe(true);
    expect(matchResult.matchDetails?.searchType).toBe('category');
    expect(matchResult.matchDetails?.matchTypes).toContain('exactMatch');

    // Should not match category without exactMatch
    const noMatchResult = matchIngredient(
      'without exact match',
      customTestDatabase,
    );
    expect(noMatchResult.matchDetails?.matched).toBeFalsy();
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
        matchTypes: ['exactMatch'],
        searchType: 'ingredient',
        matchedOn: ['test ingredient'],
      },
    });

    expect(match.matchDetails).toEqual({
      matched: true,
      confidence: 0.8,
      matchTypes: ['exactMatch'],
      searchType: 'ingredient',
      matchedOn: ['test ingredient'],
    });
  });

  test('should include additional details when provided', () => {
    const match = createMatch({
      name: 'test ingredient',
      normalized: 'test ingredient',
      details: {
        name: 'Test Ingredient',
        category: ['category1'],
        description: 'test description',
      },
    });

    expect(match.details).toEqual({
      name: 'Test Ingredient',
      category: ['category1'],
      description: 'test description',
    });
  });
});
