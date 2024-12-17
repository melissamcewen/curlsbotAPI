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
        description: 'Test category',
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
        description: 'Test category',
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

  it('should not match when search term matches exclusion', () => {
    const categories = {
      test_category: {
        id: 'test_category',
        name: 'Test Category',
        description: 'Test category',
        group: 'test_group',
        inclusions: ['silicone'],
        exclusions: ['saccharomycessilicon'],
        defaultIngredient: 'test_ingredient',
      },
    };
    const result = findCategoryByInclusion(
      categories,
      'saccharomycessilicon ferment',
    );
    expect(result).toBeUndefined();
  });

  it('should match when search term matches inclusion but not exclusion', () => {
    const categories = {
      test_category: {
        id: 'test_category',
        name: 'Test Category',
        description: 'Test category',
        group: 'test_group',
        inclusions: ['silicone'],
        exclusions: ['saccharomycessilicon'],
        defaultIngredient: 'test_ingredient',
      },
    };
    const result = findCategoryByInclusion(categories, 'dimethicone silicone');
    expect(result).toBeDefined();
    expect(result?.categoryId).toBe('test_category');

    // Should not match because "silicon ferment" is in exclusions
    const result2 = findCategoryByInclusion(
      categories,
      'dimethicone silicon ferment',
    );
    expect(result2).toBeUndefined();
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

  it('should not match when search term matches exclusion', () => {
    const groups = {
      test_group: {
        id: 'test_group',
        name: 'Test Group',
        description: 'Test group',
        inclusions: ['silicone'],
        exclusions: ['saccharomycessilicon'],
        defaultIngredient: 'test_ingredient',
      },
    };
    const result = findGroupByInclusion(groups, 'saccharomycessilicon ferment');
    expect(result).toBeUndefined();
  });

  it('should match when search term matches inclusion but not exclusion', () => {
    const groups = {
      test_group: {
        id: 'test_group',
        name: 'Test Group',
        description: 'Test group',
        inclusions: ['silicone'],
        exclusions: ['saccharomycessilicon'],
        defaultIngredient: 'test_ingredient',
      },
    };
    const result = findGroupByInclusion(groups, 'dimethicone silicone');
    expect(result).toBeDefined();
    expect(result?.groupId).toBe('test_group');
  });
});

describe('partitionSearchSpace', () => {
  it('should partition by category when matching category inclusion', () => {
    const result = partitionSearchSpace(testDatabase, 'peg');
    expect(result.database.categories).toHaveProperty('water_soluble_silicone');
    expect(result.defaultIngredient).toBe('unknown_water_soluble_silicone');
    expect(Object.keys(result.database.categories)).toHaveLength(1);
  });

  it('should correctly partition search space for waxes', () => {
    const result = partitionSearchSpace(testDatabase, 'wax');

    // Should only include wax category
    expect(Object.keys(result.database.categories)).toEqual(['non_water_soluble_waxes', 'water_soluble_waxes']);

    // Should only include wax ingredients
    const ingredientIds = Object.keys(result.database.ingredients);
    expect(ingredientIds).toContain('beeswax');
    expect(ingredientIds).toContain('emulsifying_wax');
    expect(ingredientIds).toContain('euphorbia_cerifera_wax');
    expect(ingredientIds).toContain('lonincera_japonica_honeysuckle_flower_extract');
    expect(ingredientIds).toHaveLength(4);

    // Should not include any non-wax ingredients
    expect(result.database.ingredients.dimethicone).toBeUndefined();
    expect(result.database.ingredients.sodium_laureth_sulfate).toBeUndefined();
  });

  it('should correctly partition search space for silicones', () => {
    const result = partitionSearchSpace(testDatabase, 'silicone');

    // Should include all silicone categories
    const categoryIds = Object.keys(result.database.categories);
    expect(categoryIds).toContain('non_water_soluble_silicone');
    expect(categoryIds).toContain('water_soluble_silicone');
    expect(categoryIds).toContain('evaporative_silicone');
    expect(categoryIds).toHaveLength(3);

    // Should only include silicone ingredients
    const ingredientIds = Object.keys(result.database.ingredients);
    expect(ingredientIds).toContain('dimethicone');
    expect(ingredientIds).toContain('cyclomethicone');
    expect(ingredientIds).toContain('unknown_water_soluble_silicone');
    expect(ingredientIds).toContain('unknown_non_water_soluble_silicone');
    expect(ingredientIds).toHaveLength(4);

    // Should not include any non-silicone ingredients
    expect(result.database.ingredients.beeswax).toBeUndefined();
    expect(result.database.ingredients.sodium_laureth_sulfate).toBeUndefined();
  });

  it('should return unfiltered database when no matches', () => {
    const result = partitionSearchSpace(testDatabase, 'no matches here');
    expect(result.database).toEqual(testDatabase);
    expect(result.defaultIngredient).toBeUndefined();
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

    const result = partitionSearchSpace(testDatabaseWithExtra, 'peg');
    expect(Object.keys(result.database.ingredients)).toHaveLength(2);
    expect(result.database.ingredients).toHaveProperty('unknown_water_soluble_silicone');
    expect(result.database.ingredients).toHaveProperty('another_water_soluble');
  });
});
