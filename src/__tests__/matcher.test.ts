import { matchIngredient } from '../utils/matcher';
import { testCategories } from './data/testCategories';
import { alcohols } from './data/testIngredients/alcohols';

describe('matchIngredient', () => {
  const testDatabase = {
    ingredients: alcohols,
    categories: testCategories,
  };

  test('"alcohol denat." should match denatured alcohol', () => {
    const matches = matchIngredient('alcohol denat.', testDatabase);

    expect(matches.length).toBeGreaterThan(0);
    const bestMatch = matches[0]; // First match should be highest confidence

    expect(bestMatch.matchDetails?.matched).toBe(true);
    expect(bestMatch.matchDetails?.matchTypes).toContain('partialMatch');
    expect(bestMatch.matchDetails?.searchType).toBe('ingredient');
    expect(bestMatch.matchDetails?.confidence).toBe(0.7);
    expect(bestMatch.matchDetails?.matchedOn).toEqual(['alcohol denat']);
  });

  test('"alcohol" should match alcohol from categoryGroup', () => {
    const matches = matchIngredient('alcohol', testDatabase);

    expect(matches.length).toBeGreaterThan(0);
    const categoryMatch = matches.find(
      (match) => match.matchDetails?.searchType === 'categoryGroup',
    );

    expect(categoryMatch).toBeDefined();
    expect(categoryMatch?.matchDetails?.matched).toBe(true);
    expect(categoryMatch?.matchDetails?.matchTypes).toContain('partialMatch');
    expect(categoryMatch?.matchDetails?.searchType).toBe('categoryGroup');
    expect(categoryMatch?.matchDetails?.confidence).toBe(0.5);
    expect(categoryMatch?.matchDetails?.matchedOn).toEqual(['Alcohols']);
  });

  test('should return basic info for no matches', () => {
    const matches = matchIngredient('nonexistent ingredient', testDatabase);

    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual({
      name: 'nonexistent ingredient',
      normalized: 'nonexistent ingredient',
    });
  });

  test('handle ingredient with parentheses', () => {
    const matches = matchIngredient(
      'denatured alcohol (sd alcohol 40)',
      testDatabase,
    );

    expect(matches.length).toBeGreaterThan(0);
    const categoryMatch = matches.find(
      (match) => match.matchDetails?.searchType === 'categoryGroup',
    );
    expect(categoryMatch).toBeDefined();
    const ingredientMatch = matches.find(
      (match) => match.matchDetails?.searchType === 'ingredient',
    );
    expect(ingredientMatch).toBeDefined();
    // match denatured alcohol
    expect(ingredientMatch?.matchDetails?.matchedOn).toEqual([
      'Denatured Alcohol',
    ]);
  });
});
