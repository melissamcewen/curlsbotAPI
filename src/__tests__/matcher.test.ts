import { matchIngredient } from '../utils/matchtypes';
import { testCategories } from './data/testCategories';
import { alcohols } from './data/testIngredients/alcohols';

describe('matchIngredient', () => {
  test('"alcohol denat." should match denatured alcohol', () => {
    const result = matchIngredient(
      'alcohol denat.',
      'denatured_alcohol',
      alcohols.denatured_alcohol,
      null,
      null,
    );

    expect(result.matched).toBe(true);
    expect(result.matchTypes).toContain('partialMatch');
    expect(result.confidence).toBe(0.7);
    expect(result.matchedOn).toEqual(['alcohol denat']);
  });

  test('"alcohol" should match alcohol from categoryGroup', () => {
    const result = matchIngredient(
      'alcohol',
      'alcohols',
      alcohols.denatured_alcohol, // dummy ingredient
      null,
      testCategories.alcohols,
    );

    expect(result.matched).toBe(true);
    expect(result.matchTypes).toContain('categoryGroupMatch');
    expect(result.confidence).toBe(0.8);
    expect(result.matchedOn).toEqual(['Alcohols']);
  });
});
