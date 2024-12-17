import { describe, expect, test } from 'vitest';
import { findIngredient, getCategoryGroups, getIngredientTerms, findCategoryByInclusion, findGroupByInclusion, partitionSearchSpace, filterDatabaseByGroup, filterDatabaseByCategory } from '../../src/utils/databaseUtils';

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
      expect(categoryKeys).toContain('non_water_soluble_silicone');
      expect(categoryKeys).toContain('water_soluble_silicone');
      expect(categoryKeys).toHaveLength(2);

      // Check silicone ingredients
      const ingredientKeys = Object.keys(partitionedDb.ingredients);
      expect(ingredientKeys).toContain('dimethicone');
      expect(ingredientKeys).toContain('unknown_water_soluble_silicone');
      expect(ingredientKeys).toContain('unknown_non_water_soluble_silicone');
      expect(ingredientKeys).toHaveLength(3);

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
      expect(Object.keys(result.partitionedDatabase.categories)).toEqual(['water_soluble_silicone']);
      // Should only contain ingredients from that category
      const categoryIngredients = Object.values(result.partitionedDatabase.ingredients)
        .filter(ingredient => ingredient.categories?.includes('water_soluble_silicone'));
      expect(Object.values(result.partitionedDatabase.ingredients)).toEqual(categoryIngredients);
    });

    it('should partition database by group when matching by inclusion', () => {
      const result = findIngredient(testDatabase, 'silicone');
      // Should contain all silicone categories
      const siliconeCategories = Object.entries(testDatabase.categories)
        .filter(([_, category]) => category.group === 'silicones')
        .map(([id]) => id);
      expect(Object.keys(result.partitionedDatabase.categories).sort()).toEqual(siliconeCategories.sort());
    });
  });

  describe('partitionSearchSpace', () => {
    it('should return full database when no matches found', () => {
      const result = partitionSearchSpace(testDatabase, 'no matches here');
      expect(result.database).toEqual(testDatabase);
      expect(result.defaultIngredient).toBeUndefined();
    });

    it('should partition by category when category inclusion matches', () => {
      const result = partitionSearchSpace(testDatabase, 'peg');
      expect(Object.keys(result.database.categories)).toEqual(['water_soluble_silicone']);
      expect(result.defaultIngredient).toBe('unknown_water_soluble_silicone');
    });

    it('should partition by group when group inclusion matches', () => {
      const result = partitionSearchSpace(testDatabase, 'silicone');
      // Should contain both silicone categories
      expect(Object.keys(result.database.categories).sort()).toEqual([
        'non_water_soluble_silicone',
        'water_soluble_silicone'
      ].sort());
      expect(result.defaultIngredient).toBe('unknown_non_water_soluble_silicone');
    });

    it('should prefer category match over group match', () => {
      // Add a test group that would match the same term
      const testDb = {
        ...testDatabase,
        groups: {
          ...testDatabase.groups,
          test_group: {
            id: 'test_group',
            name: 'Test Group',
            inclusions: ['peg'],
            defaultIngredient: 'should_not_use_this'
          }
        }
      };
      const result = partitionSearchSpace(testDb, 'peg');
      // Should still match water soluble silicone category
      expect(Object.keys(result.database.categories)).toEqual(['water_soluble_silicone']);
      expect(result.defaultIngredient).toBe('unknown_water_soluble_silicone');
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
      categories: ['test_category']
    };
    expect(getIngredientTerms(ingredient)).toEqual(['Test Ingredient']);
  });

  it('should return array with name and synonyms when they exist', () => {
    const ingredient = {
      id: 'dimethicone',
      name: 'Dimethicone',
      categories: ['non_water_soluble_silicone'],
      synonyms: ['pdms', 'polydimethylsiloxane']
    };
    expect(getIngredientTerms(ingredient)).toEqual(['Dimethicone', 'pdms', 'polydimethylsiloxane']);
  });
});

describe('findCategoryByInclusion', () => {
  it('should find category when search term includes an inclusion term', () => {
    const result = findCategoryByInclusion(testDatabase.categories, 'peg-dimethicone');
    expect(result).toBeDefined();
    expect(result?.categoryId).toBe('water_soluble_silicone');
    expect(result?.defaultIngredient).toBe('unknown_water_soluble_silicone');
  });

  it('should find category case-insensitively', () => {
    const result = findCategoryByInclusion(testDatabase.categories, 'PEG-DIMETHICONE');
    expect(result).toBeDefined();
    expect(result?.categoryId).toBe('water_soluble_silicone');
  });

  it('should return undefined when no inclusion matches', () => {
    const result = findCategoryByInclusion(testDatabase.categories, 'no match here');
    expect(result).toBeUndefined();
  });

  it('should handle categories without inclusions', () => {
    const categories = {
      test: {
        id: 'test',
        name: 'Test',
        group: 'test_group'
      }
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
        inclusions: ['peg']
      }
    };
    const result = findCategoryByInclusion(categories, 'peg-dimethicone');
    // Should return whichever category is first in object iteration order
    expect(result).toBeDefined();
    expect(['water_soluble_silicone', 'test_category']).toContain(result?.categoryId);
  });
});

describe('findGroupByInclusion', () => {
  it('should find group when search term includes an inclusion term', () => {
    const result = findGroupByInclusion(testDatabase.groups, 'silicone based');
    expect(result).toBeDefined();
    expect(result?.groupId).toBe('silicones');
    expect(result?.defaultIngredient).toBe('unknown_non_water_soluble_silicone');
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
        name: 'Test'
      }
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
        inclusions: ['silicone']
      }
    };
    const result = findGroupByInclusion(groups, 'silicone based');
    // Should return whichever group is first in object iteration order
    expect(result).toBeDefined();
    expect(['silicones', 'test_group']).toContain(result?.groupId);
  });
});

describe('filterDatabaseByGroup', () => {
  it('should return database filtered by group', () => {
    const result = filterDatabaseByGroup(testDatabase, 'silicones');

    // Should only include silicone categories
    expect(Object.values(result.categories)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ group: 'silicones' })
      ])
    );
    expect(Object.values(result.categories).every(cat => cat.group === 'silicones')).toBe(true);

    // Should only include ingredients from silicone categories
    const siliconeCategories = Object.keys(result.categories);
    Object.values(result.ingredients).forEach(ingredient => {
      expect(ingredient.categories?.some(cat => siliconeCategories.includes(cat))).toBe(true);
    });
  });

  it('should handle group with no categories', () => {
    const result = filterDatabaseByGroup(testDatabase, 'nonexistent_group');
    expect(Object.keys(result.categories)).toHaveLength(0);
    expect(Object.keys(result.ingredients)).toHaveLength(0);
  });

  it('should handle group with no ingredients', () => {
    // Create a test database with a group that has categories but no ingredients
    const testDb = {
      ...testDatabase,
      categories: {
        ...testDatabase.categories,
        empty_category: {
          id: 'empty_category',
          name: 'Empty Category',
          description: 'A category with no ingredients',
          group: 'empty_group'
        }
      },
      groups: {
        ...testDatabase.groups,
        empty_group: {
          id: 'empty_group',
          name: 'Empty Group'
        }
      }
    };
    const result = filterDatabaseByGroup(testDb, 'empty_group');
    expect(Object.keys(result.categories)).toHaveLength(1);
    expect(Object.keys(result.ingredients)).toHaveLength(0);
  });
});

describe('filterDatabaseByCategory', () => {
  it('should return database filtered by category', () => {
    const result = filterDatabaseByCategory(testDatabase, 'water_soluble_silicone');

    // Should only include the specified category
    expect(Object.keys(result.categories)).toEqual(['water_soluble_silicone']);

    // Should only include ingredients from that category
    Object.values(result.ingredients).forEach(ingredient => {
      expect(ingredient.categories).toContain('water_soluble_silicone');
    });

    // Should have empty groups
    expect(Object.keys(result.groups)).toHaveLength(0);
  });

  it('should handle category with no ingredients', () => {
    // Create a test database with an empty category
    const testDb = {
      ...testDatabase,
      categories: {
        ...testDatabase.categories,
        empty_category: {
          id: 'empty_category',
          name: 'Empty Category',
          description: 'A category with no ingredients',
          group: 'test_group'
        }
      }
    };
    const result = filterDatabaseByCategory(testDb, 'empty_category');
    expect(Object.keys(result.categories)).toEqual(['empty_category']);
    expect(Object.keys(result.ingredients)).toHaveLength(0);
    expect(Object.keys(result.groups)).toHaveLength(0);
  });

  it('should handle nonexistent category', () => {
    const result = filterDatabaseByCategory(testDatabase, 'nonexistent_category');
    expect(Object.keys(result.categories)).toEqual(['nonexistent_category']);
    expect(Object.keys(result.ingredients)).toHaveLength(0);
    expect(Object.keys(result.groups)).toHaveLength(0);
  });

  it('should handle ingredients with undefined categories', () => {
    // Create a test database with an ingredient that has undefined categories
    const testDb = {
      ...testDatabase,
      ingredients: {
        ...testDatabase.ingredients,
        no_categories: {
          id: 'no_categories',
          name: 'No Categories'
        }
      }
    };
    const result = filterDatabaseByCategory(testDb, 'water_soluble_silicone');
    expect(Object.keys(result.categories)).toEqual(['water_soluble_silicone']);
    expect(Object.keys(result.ingredients)).not.toContain('no_categories');
  });
});
