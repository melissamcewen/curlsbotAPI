import { describe, it, expect } from 'vitest';

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
    // ... existing test setup ...

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
  });
});
