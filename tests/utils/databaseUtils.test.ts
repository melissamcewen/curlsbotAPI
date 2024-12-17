import { describe, expect, test } from 'vitest';
import {
  findIngredient,
  getCategoryGroups,
  getIngredientTerms,
  findCategoryByInclusion,
  findGroupByInclusion,
  partitionSearchSpace,
  filterDatabaseByGroup,
  filterDatabaseByCategory,
} from '../../src/utils/databaseUtils';

import { testDatabase } from '../fixtures/test_bundled_data';

describe('findIngredient', () => {
  test('finds exact ingredient match', () => {
    const result = findIngredient(testDatabase, 'dimethicone');

    expect(result).toBeDefined();
    expect(result?.ingredient).toBeDefined();
    expect(result?.ingredient?.name).toBe('Dimethicone');
    expect(result?.normalized).toBe('dimethicone');
  });

  test('finds exact ingredient match case-insensitive', () => {
    const result = findIngredient(testDatabase, 'DiMeThIcOnE');

    expect(result).toBeDefined();
    expect(result?.ingredient).toBeDefined();
    expect(result?.ingredient?.name).toBe('Dimethicone');
    expect(result?.normalized).toBe('dimethicone');
  });

  test('finds ingredient by synonym', () => {
    const result = findIngredient(testDatabase, 'pdms');

    expect(result).toBeDefined();
    expect(result?.ingredient?.name).toBe('Dimethicone');
  });

  test('returns undefined ingredient for non-matching term', () => {
    const result = findIngredient(testDatabase, 'nonexistent ingredient');

    expect(result).toBeDefined();
    expect(result?.ingredient).toBeUndefined();
    expect(result?.input).toBe('nonexistent ingredient');
  });

  test('finds ingredient through category inclusion', () => {
    const result = findIngredient(testDatabase, 'peg-dimethicone');

    expect(result).toBeDefined();
    expect(result?.ingredient).toBeDefined();
    expect(result?.ingredient?.id).toBe('unknown_water_soluble_silicone');
  });

  test('finds default ingredient through group inclusion', () => {
    const result = findIngredient(testDatabase, 'silicone');

    expect(result).toBeDefined();
    expect(result?.ingredient).toBeDefined();
    expect(result?.ingredient?.id).toBe('unknown_non_water_soluble_silicone');
  });

  test('finds default ingredient through alternate group inclusion', () => {
    const result = findIngredient(testDatabase, 'something with cone in it');

    expect(result).toBeDefined();
    expect(result?.ingredient).toBeDefined();
    expect(result?.ingredient?.id).toBe('unknown_non_water_soluble_silicone');
  });

  describe('database partitioning', () => {
    test('correctly partitions by silicones group', () => {
      const result = findIngredient(testDatabase, 'silicone');
      const partitionedDb = result.partitionedDatabase;

      // Check silicone categories
      const categoryKeys = Object.keys(partitionedDb.categories);
         console.log('test');
         console.log(categoryKeys);
      expect(categoryKeys).toContain('non_water_soluble_silicone');
      expect(categoryKeys).toContain('water_soluble_silicone');
      expect(categoryKeys).toContain('evaporative_silicones');

      expect(categoryKeys).toHaveLength(3);

      // Check silicone ingredients
      const ingredientKeys = Object.keys(partitionedDb.ingredients);
      expect(ingredientKeys).toContain('dimethicone');
      expect(ingredientKeys).toContain('cyclomethicone');
      expect(ingredientKeys).toContain('unknown_water_soluble_silicone');
      expect(ingredientKeys).toContain('unknown_non_water_soluble_silicone');
      expect(ingredientKeys).toHaveLength(4);

      // Verify non-silicone ingredients are excluded
      expect(partitionedDb.ingredients.sodium_laureth_sulfate).toBeUndefined();
    });

    test('correctly partitions by water-soluble silicone category', () => {
      const result = findIngredient(testDatabase, 'peg-dimethicone');
      const partitionedDb = result.partitionedDatabase;

      // Should only include water-soluble silicone category
      const categoryKeys = Object.keys(partitionedDb.categories);
      expect(categoryKeys).toContain('water_soluble_silicone');
      expect(categoryKeys).toHaveLength(1);

      // Should only include water-soluble silicone ingredients
      const ingredientKeys = Object.keys(partitionedDb.ingredients);
      expect(ingredientKeys).toContain('unknown_water_soluble_silicone');
      expect(ingredientKeys).toHaveLength(1);

      // Verify non-water-soluble silicones are excluded
      expect(partitionedDb.ingredients.dimethicone).toBeUndefined();
    });
  });

  describe('findIngredient', () => {
    it('should find an ingredient by exact name', () => {
      const result = findIngredient(testDatabase, 'dimethicone');
      expect(result.ingredient?.id).toBe('dimethicone');
    });

    it('should find an ingredient case-insensitively', () => {
      const result = findIngredient(testDatabase, 'DiMeThIcOnE');
      expect(result.ingredient?.id).toBe('dimethicone');
    });

    it('should find an ingredient by synonym', () => {
      const result = findIngredient(testDatabase, 'pdms');
      expect(result.ingredient?.id).toBe('dimethicone');
    });

    it('should return undefined for unknown ingredients', () => {
      const result = findIngredient(testDatabase, 'nonexistent ingredient');
      expect(result.ingredient).toBeUndefined();
    });

    it('should use category defaultIngredient when matching by inclusion', () => {
      const result = findIngredient(testDatabase, 'peg-dimethicone');
      expect(result.ingredient?.id).toBe('unknown_water_soluble_silicone');
    });

    it('should use group defaultIngredient when matching by inclusion', () => {
      const result = findIngredient(testDatabase, 'silicone');
      expect(result.ingredient?.id).toBe('unknown_non_water_soluble_silicone');
    });

    it('should use category defaultIngredient over group defaultIngredient', () => {
      const result = findIngredient(testDatabase, 'something with cone in it');
      expect(result.ingredient?.id).toBe('unknown_non_water_soluble_silicone');
    });

    it('should partition database by category when matching by inclusion', () => {
      const result = findIngredient(testDatabase, 'peg-dimethicone');
      // Should only contain water soluble silicone category
      expect(Object.keys(result.partitionedDatabase.categories)).toEqual([
        'water_soluble_silicone',
      ]);
      // Should only contain ingredients from that category
      const categoryIngredients = Object.values(
        result.partitionedDatabase.ingredients,
      ).filter((ingredient) =>
        ingredient.categories?.includes('water_soluble_silicone'),
      );
      expect(Object.values(result.partitionedDatabase.ingredients)).toEqual(
        categoryIngredients,
      );
    });

    it('should partition database by group when matching by inclusion', () => {
      const result = findIngredient(testDatabase, 'silicone');
      // Should contain all silicone categories
      const siliconeCategories = Object.entries(testDatabase.categories)
        .filter(([_, category]) => category.group === 'silicones')
        .map(([id]) => id);
      expect(Object.keys(result.partitionedDatabase.categories).sort()).toEqual(
        siliconeCategories.sort(),
      );
    });
  });

  describe('partitionSearchSpace', () => {
    it('should partition by category when matching category inclusion', () => {
      const result = findIngredient(testDatabase, 'peg');
      expect(result.partitionedDatabase.categories).toHaveProperty(
        'water_soluble_silicone',
      );
      expect(result.ingredient?.id).toBe('unknown_water_soluble_silicone');
      expect(Object.keys(result.partitionedDatabase.categories)).toHaveLength(
        1,
      );
    });

    it('should use category defaultIngredient when available', () => {
      const result = findIngredient(testDatabase, 'peg');
      expect(result.ingredient?.id).toBe('unknown_water_soluble_silicone');
    });

    it('should return filtered database with only matching category and its ingredients', () => {
      const result = findIngredient(testDatabase, 'peg');
      const categoryId = 'water_soluble_silicone';

      // Should only have the matching category
      expect(Object.keys(result.partitionedDatabase.categories)).toEqual([
        categoryId,
      ]);

      // All ingredients should belong to this category
      Object.values(result.partitionedDatabase.ingredients).forEach(
        (ingredient) => {
          expect(ingredient.categories).toContain(categoryId);
        },
      );
    });

    it('should handle category with multiple ingredients', () => {
      // First add another ingredient to the water soluble silicone category
      const testDatabaseWithExtra = {
        ...testDatabase,
        ingredients: {
          ...testDatabase.ingredients,
          another_water_soluble: {
            id: 'another_water_soluble',
            name: 'Another Water Soluble',
            categories: ['water_soluble_silicone'],
          },
        },
      };

      const result = findIngredient(testDatabaseWithExtra, 'peg');
      expect(Object.keys(result.partitionedDatabase.ingredients)).toHaveLength(
        2,
      );
      expect(result.partitionedDatabase.ingredients).toHaveProperty(
        'unknown_water_soluble_silicone',
      );
      expect(result.partitionedDatabase.ingredients).toHaveProperty(
        'another_water_soluble',
      );
    });
  });
});

describe('getCategoryGroups', () => {
  test('returns unique group IDs for given category IDs', () => {
    const categoryIds = [
      'non_water_soluble_silicone',
      'water_soluble_silicone',
      'sulfates',
    ];
    const groups = getCategoryGroups(testDatabase, categoryIds);

    expect(groups).toEqual(['silicones', 'detergents']);
    expect(new Set(groups).size).toBe(2);
  });

  test('handles non-existent category IDs', () => {
    const groups = getCategoryGroups(testDatabase, ['nonexistent']);
    expect(groups).toEqual([]);
  });

  test('returns empty array for empty input', () => {
    const groups = getCategoryGroups(testDatabase, []);
    expect(groups).toEqual([]);
  });
});

describe('getIngredientTerms', () => {
  it('should return array with just name when no synonyms exist', () => {
    const ingredient = {
      id: 'test',
      name: 'Test Ingredient',
      categories: ['test_category'],
    };
    expect(getIngredientTerms(ingredient)).toEqual(['Test Ingredient']);
  });

  it('should return array with name and synonyms when they exist', () => {
    const ingredient = {
      id: 'dimethicone',
      name: 'Dimethicone',
      categories: ['non_water_soluble_silicone'],
      synonyms: ['pdms', 'polydimethylsiloxane'],
    };
    expect(getIngredientTerms(ingredient)).toEqual([
      'Dimethicone',
      'pdms',
      'polydimethylsiloxane',
    ]);
  });
});

describe('findCategoryByInclusion', () => {
  it('should find category when search term includes an inclusion term', () => {
    const result = findCategoryByInclusion(
      testDatabase.categories,
      'peg-dimethicone',
    );
    expect(result).toBeDefined();
    expect(result?.categoryId).toBe('water_soluble_silicone');
    expect(result?.defaultIngredient).toBe('unknown_water_soluble_silicone');
  });

  it('should find category case-insensitively', () => {
    const result = findCategoryByInclusion(
      testDatabase.categories,
      'PEG-DIMETHICONE',
    );
    expect(result).toBeDefined();
    expect(result?.categoryId).toBe('water_soluble_silicone');
  });

  it('should return undefined when no inclusion matches', () => {
    const result = findCategoryByInclusion(
      testDatabase.categories,
      'no match here',
    );
    expect(result).toBeUndefined();
  });

  it('should handle categories without inclusions', () => {
    const categories = {
      test: {
        id: 'test',
        name: 'Test',
        group: 'test_group',
      },
    };
    const result = findCategoryByInclusion(categories, 'test');
    expect(result).toBeUndefined();
  });

  it('should return first matching category when multiple match', () => {
    const categories = {
      ...testDatabase.categories,
      test_category: {
        id: 'test_category',
        name: 'Test Category',
        group: 'test_group',
        inclusions: ['peg'],
      },
    };
    const result = findCategoryByInclusion(categories, 'peg-dimethicone');
    // Should return whichever category is first in object iteration order
    expect(result).toBeDefined();
    expect(['water_soluble_silicone', 'test_category']).toContain(
      result?.categoryId,
    );
  });
});

describe('findGroupByInclusion', () => {
  it('should find group when search term includes an inclusion term', () => {
    const result = findGroupByInclusion(testDatabase.groups, 'silicone based');
    expect(result).toBeDefined();
    expect(result?.groupId).toBe('silicones');
    expect(result?.defaultIngredient).toBe(
      'unknown_non_water_soluble_silicone',
    );
  });

  it('should find group case-insensitively', () => {
    const result = findGroupByInclusion(testDatabase.groups, 'SILICONE');
    expect(result).toBeDefined();
    expect(result?.groupId).toBe('silicones');
  });

  it('should return undefined when no inclusion matches', () => {
    const result = findGroupByInclusion(testDatabase.groups, 'no match here');
    expect(result).toBeUndefined();
  });

  it('should handle groups without inclusions', () => {
    const groups = {
      test: {
        id: 'test',
        name: 'Test',
      },
    };
    const result = findGroupByInclusion(groups, 'test');
    expect(result).toBeUndefined();
  });

  it('should return first matching group when multiple match', () => {
    const groups = {
      ...testDatabase.groups,
      test_group: {
        id: 'test_group',
        name: 'Test Group',
        inclusions: ['silicone'],
      },
    };
    const result = findGroupByInclusion(groups, 'silicone based');
    // Should return whichever group is first in object iteration order
    expect(result).toBeDefined();
    expect(['silicones', 'test_group']).toContain(result?.groupId);
  });
});
