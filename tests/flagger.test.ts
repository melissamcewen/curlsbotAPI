import { Flagger } from '../src/utils/flagger';
import type { IngredientMatch } from '../src/types';

import { testCategories } from './data/testCategories';
import { alcohols } from './data/testIngredients/alcohols';

describe('Flagger', () => {
  const database = {
    ingredients: alcohols,
    categories: testCategories,
  };

  describe('getFlagsForMatch', () => {
    it('should handle match with undefined categories when checking category groups', () => {
      const flagger = new Flagger(database, {
        flaggedCategories: ['fatty alcohol'],
      });

      const match: IngredientMatch = {
        normalized: 'test',
        categories: undefined,
        uuid: 'test-id',
        name: 'test',
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.flags.categories).toHaveLength(0);
    });

    it('should process categories when they exist', () => {
      const flagger = new Flagger(database, {
        flaggedCategories: ['fatty alcohol'],
      });

      const match: IngredientMatch = {
        normalized: 'cetyl alcohol',
        categories: ['fatty alcohol'],
        uuid: '123',
        name: 'Cetyl Alcohol',
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.flags.categories).toContain('fatty alcohol');
      expect(result.matchDetails.flagged).toBe(true);
    });

    it('should flag ingredients by id', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['sodium_lauryl_sulfate'],
      });

      const match: IngredientMatch = {
        normalized: 'sodium lauryl sulfate',
        categories: [],
        uuid: '123',
        name: 'Sodium Lauryl Sulfate',
        details: {
          id: 'sodium_lauryl_sulfate',
          name: 'Sodium Lauryl Sulfate',
          category: [],
        },
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.flags.ingredients).toContain('sodium_lauryl_sulfate');
      expect(result.matchDetails.flagged).toBe(true);
    });

    it('should flag ingredients by category', () => {
      const flagger = new Flagger(database, {
        flaggedCategories: ['solvent alcohol'],
      });

      const match: IngredientMatch = {
        normalized: 'benzyl alcohol',
        categories: ['solvent alcohol'],
        uuid: '123',
        name: 'Benzyl Alcohol',
        details: {
          id: 'benzyl-alcohol',
          name: 'Benzyl Alcohol',
          category: ['solvent alcohol'],
        },
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.flags.categories).toContain('solvent alcohol');
      expect(result.matchDetails.flagged).toBe(true);
    });

    it('should flag ingredients by category group', () => {
      const flagger = new Flagger(database, {
        flaggedGroups: ['alcohols'],
      });

      const match: IngredientMatch = {
        normalized: 'cetyl alcohol',
        categories: ['fatty_alcohol'],
        uuid: 'cetyl-alcohol',
        name: 'Cetyl Alcohol',
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.flags.Groups).toContain('alcohols');
      expect(result.matchDetails.flagged).toBe(true);
    });

    it('should not flag non-matching ingredients', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['sodium lauryl sulfate'],
        flaggedCategories: ['sulfate'],
        flaggedGroups: ['Alcohols'],
      });

      const match: IngredientMatch = {
        normalized: 'water',
        categories: ['water'],
        uuid: 'water',
        name: 'Water',
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.flags.ingredients).toHaveLength(0);
      expect(result.flags.categories).toHaveLength(0);
      expect(result.flags.Groups).toHaveLength(0);
      expect(result.matchDetails.flagged).toBe(false);
    });

    it('should handle empty flag options', () => {
      const flagger = new Flagger(database, {});

      const match: IngredientMatch = {
        normalized: 'sodium lauryl sulfate',
        categories: ['sulfate'],
        uuid: '123',
        name: 'Sodium Lauryl Sulfate',
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.flags.ingredients).toHaveLength(0);
      expect(result.flags.categories).toHaveLength(0);
      expect(result.flags.Groups).toHaveLength(0);
      expect(result.matchDetails.flagged).toBe(false);
    });

    it('should always return matchDetails with matched true', () => {
      const flagger = new Flagger(database, {
        flaggedCategories: ['fatty alcohol'],
      });

      const match: IngredientMatch = {
        normalized: 'cetyl alcohol',
        categories: ['fatty alcohol'],
        uuid: '123',
        name: 'Cetyl Alcohol',
      };

      const result = flagger.getFlagsForMatch(match);
      expect(result.matchDetails.matched).toBe(true);
      expect(result.matchDetails.flagged).toBe(true);
    });
  });
});
