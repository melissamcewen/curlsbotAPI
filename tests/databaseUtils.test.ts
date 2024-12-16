import { describe, expect, test } from 'vitest';
import { findIngredient, getCategoryGroups } from '../src/utils/databaseUtils';

import { testDatabase } from './fixtures/test_bundled_data';

describe('findIngredient', () => {
  test('finds exact ingredient match', () => {
    const result = findIngredient(testDatabase, 'dimethicone');

    console.log('Search Result:', result);

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

      // Should only include silicone categories
      expect(Object.keys(partitionedDb.categories)).toEqual([
        'non-water-soluble_silicone',
        'water-soluble_silicone'
      ]);

      // Should only include silicone ingredients
      expect(Object.keys(partitionedDb.ingredients)).toEqual([
        'dimethicone',
        'unknown_water_soluble_silicone',
        'unknown_non_water_soluble_silicone'
      ]);

      // Should not include detergents
      expect(partitionedDb.ingredients.sodium_laureth_sulfate).toBeUndefined();
    });

    test('correctly partitions by water-soluble silicone category', () => {
      const result = findIngredient(testDatabase, 'peg-dimethicone');
      const partitionedDb = result.partitionedDatabase;

      // Should only include water-soluble silicone category
      expect(Object.keys(partitionedDb.categories)).toEqual(['water-soluble_silicone']);

      // Should only include water-soluble silicone ingredients
      expect(Object.keys(partitionedDb.ingredients)).toEqual(['unknown_water_soluble_silicone']);

      // Should not include non-water-soluble silicones
      expect(partitionedDb.ingredients.dimethicone).toBeUndefined();
    });

    test('returns full database when no partitioning is possible', () => {
      const result = findIngredient(testDatabase, 'nonexistent');
      const partitionedDb = result.partitionedDatabase;

      // Should include all categories and ingredients
      expect(Object.keys(partitionedDb.categories)).toEqual([
        'non-water-soluble_silicone',
        'water-soluble_silicone',
        'sulfates'
      ]);
      expect(Object.keys(partitionedDb.ingredients)).toEqual([
        'dimethicone',
        'sodium_laureth_sulfate',
        'unknown_water_soluble_silicone',
        'unknown_non_water_soluble_silicone'
      ]);
    });
  });
});

describe('getCategoryGroups', () => {
  test('returns unique group IDs for given category IDs', () => {
    const categoryIds = [
      'non-water-soluble_silicone',
      'water-soluble_silicone',
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
