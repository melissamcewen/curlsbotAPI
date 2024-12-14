import { describe, it, expect } from 'vitest';

import { getIngredientCategories, getCategoryGroups } from '../../src/utils/databaseUtils';
import { testDatabase } from '../fixtures/testDatabase';

describe('Database Utils Integration Tests', () => {
  describe('Category and Group Relationships', () => {
    it('should get categories for multiple ingredients', () => {
      const categories = getIngredientCategories(testDatabase, ['emollient_alcohol']);
      expect(categories).toEqual(['emollient_alcohol']);
    });

    it('should handle mix of known and unknown categories', () => {
      const categories = getIngredientCategories(testDatabase, ['emollient_alcohol', 'unknown_category']);
      expect(categories).toEqual(['emollient_alcohol']);
    });

    it('should handle mix of known and unknown categories in groups', () => {
      const groups = getCategoryGroups(testDatabase, ['emollient_alcohol', 'unknown_category']);
      expect(groups).toEqual(['alcohols']);
    });

    it('should maintain category-group relationships', () => {
      const categories = getIngredientCategories(testDatabase, ['emollient_alcohol', 'drying_alcohol']);
      const groups = getCategoryGroups(testDatabase, categories);
      expect(groups).toEqual(['alcohols']);
    });
  });
});
