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
        id: 'test-id',
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
        id: 'cetyl-alcohol',
        name: 'Cetyl Alcohol',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.categories).toContain('fatty alcohol');
    });

    it('should flag ingredients by their synonyms', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['alternate name'],
      });

      const match: IngredientMatch = {
        normalized: 'main name',
        categories: [],
        id: 'test-id',
        name: 'Main Name',
        details: {
          synonyms: ['alternate name', 'another name']
        }
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.ingredients).toContain('alternate name');
      expect(match.matchDetails?.flagged).toBe(true);
    });

    it('should initialize matchDetails when undefined', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['test ingredient'],
      });

      const match: IngredientMatch = {
        normalized: 'test ingredient',
        categories: [],
        id: 'test-id',
        name: 'Test Ingredient',
      };

      flagger.getFlagsForMatch(match);
      expect(match.matchDetails).toBeDefined();
      expect(match.matchDetails?.matched).toBe(true);
      expect(match.matchDetails?.flagged).toBe(true);
    });

    it('should flag ingredients by name', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['sodium lauryl sulfate'],
      });

      const match: IngredientMatch = {
        normalized: 'sodium lauryl sulfate',
        categories: [],
        id: 'sls',
        name: 'Sodium Lauryl Sulfate',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.ingredients).toContain('sodium lauryl sulfate');
      expect(match.matchDetails?.flagged).toBe(true);
    });

    it('should flag ingredients by category', () => {
      const flagger = new Flagger(database, {
        flaggedCategories: ['solvent alcohol'],
      });

      const match: IngredientMatch = {
        normalized: 'benzyl alcohol',
        categories: ['solvent alcohol'],
        id: 'benzyl-alcohol',
        name: 'Benzyl Alcohol',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.categories).toContain('solvent alcohol');
      expect(match.matchDetails?.flagged).toBe(true);
    });

    it('should flag ingredients by category group', () => {
      const flagger = new Flagger(database, {
        flaggedCategoryGroups: ['Alcohols'],
      });

      const match: IngredientMatch = {
        normalized: 'cetyl alcohol',
        categories: ['fatty alcohol'],
        id: 'cetyl-alcohol',
        name: 'Cetyl Alcohol',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.categoryGroups).toContain('Alcohols');
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
        id: 'water',
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
        id: 'sls',
        name: 'Sodium Lauryl Sulfate',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.ingredients).toHaveLength(0);
      expect(flags.categories).toHaveLength(0);
      expect(flags.categoryGroups).toHaveLength(0);
      expect(match.matchDetails?.flagged).toBe(false);
    });

    it('should handle case insensitive flagging', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['SODIUM LAURYL SULFATE'],
        flaggedCategories: ['SOLVENT ALCOHOL'],
      });

      const match: IngredientMatch = {
        normalized: 'sodium lauryl sulfate',
        categories: ['sulfate'],
        id: 'sls',
        name: 'Sodium Lauryl Sulfate',
      };

      const flags = flagger.getFlagsForMatch(match);
      expect(flags.ingredients).toContain('sodium lauryl sulfate');
      expect(match.matchDetails?.flagged).toBe(true);
    });

    it('should update existing matchDetails', () => {
      const flagger = new Flagger(database, {
        flaggedIngredients: ['test ingredient'],
      });

      const match: IngredientMatch = {
        normalized: 'test ingredient',
        categories: [],
        id: 'test-id',
        name: 'Test Ingredient',
        matchDetails: {
          matched: true,
          flagged: false
        }
      };

      flagger.getFlagsForMatch(match);
      expect(match.matchDetails?.flagged).toBe(true);
      expect(match.matchDetails?.matched).toBe(true);
    });
  });
});
