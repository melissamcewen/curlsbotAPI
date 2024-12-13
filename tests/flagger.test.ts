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
        categories: undefined, // explicitly set categories to undefined
        uuid: 'test-id',
        name: 'test',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.categories).toHaveLength(0);
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

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.categories).toContain('fatty alcohol');
    });

    it('should initialize matchDetails when undefined', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['test_ingredient'],
      });

      const match: IngredientMatch = {
        normalized: 'test ingredient',
        categories: [],
        uuid: '123',
        name: 'Test Ingredient',
        details: {
          id: 'test_ingredient',
          name: 'Test Ingredient',
          category: [],
        },
      };

      flagger.getFlagsForMatch(match);
      expect(match.matchDetails).toBeDefined();
      expect(match.matchDetails?.matched).toBe(true);
      expect(match.matchDetails?.flagged).toBe(true);
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

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.ingredients).toContain('sodium_lauryl_sulfate');
      expect(match.matchDetails?.flagged).toBe(true);
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

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.categories).toContain('solvent alcohol');
      expect(match.matchDetails?.flagged).toBe(true);
    });

    it('should flag ingredients by category group', () => {
      const flagger = new Flagger(database, {
        flaggedCategoryGroups: ['alcohols'],
      });

      const match: IngredientMatch = {
        normalized: 'cetyl alcohol',
        categories: ['fatty_alcohol'],
        uuid: 'cetyl-alcohol',
        name: 'Cetyl Alcohol',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.categoryGroups).toContain('alcohols');
      expect(match.matchDetails?.flagged).toBe(true);
    });

    it('should not flag non-matching ingredients', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['sodium lauryl sulfate'],
        flaggedCategories: ['sulfate'],
        flaggedCategoryGroups: ['Alcohols'],
      });

      const match: IngredientMatch = {
        normalized: 'water',
        categories: ['water'],
        uuid: 'water',
        name: 'Water',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.ingredients).toHaveLength(0);
      expect(flags.categories).toHaveLength(0);
      expect(flags.categoryGroups).toHaveLength(0);
      expect(match.matchDetails?.flagged).toBe(false);
    });

    it('should handle empty flag options', () => {
      const flagger = new Flagger(database, {});

      const match: IngredientMatch = {
        normalized: 'sodium lauryl sulfate',
        categories: ['sulfate'],
        uuid: '123',
        name: 'Sodium Lauryl Sulfate',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.ingredients).toHaveLength(0);
      expect(flags.categories).toHaveLength(0);
      expect(flags.categoryGroups).toHaveLength(0);
      expect(match.matchDetails?.flagged).toBe(false);
    });

    it('should update existing matchDetails', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['test_ingredient'],
      });

      const match: IngredientMatch = {
        normalized: 'test ingredient',
        categories: [],
        uuid: '123',
        name: 'Test Ingredient',
        details: {
          id: 'test_ingredient',
          name: 'Test Ingredient',
          category: [],
        },
        matchDetails: {
          matched: true,
          flagged: false,
        },
      };

      flagger.getFlagsForMatch(match);
      expect(match.matchDetails?.flagged).toBe(true);
      expect(match.matchDetails?.matched).toBe(true);
    });
  });
});
