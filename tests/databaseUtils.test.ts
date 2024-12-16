import { describe, expect, test } from 'vitest';
import type { IngredientMatch } from '../src/types';
import {
  findIngredient,
  getCategoryGroups,
} from '../src/utils/databaseUtils';

import { testDatabase } from './fixtures/test_bundled_data';

describe('findIngredient', () => {
  test('finds exact ingredient match', () => {
    const result = findIngredient(testDatabase, 'Dimethicone');

    expect(result).toBeDefined();
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
    expect(result?.ingredient?.categories).toContain('water-soluble_silicone');
  });

  test('finds default ingredient through group inclusion', () => {
    const result = findIngredient(testDatabase, 'new silicone ingredient');

    expect(result).toBeDefined();
    expect(result?.ingredient?.id).toBe('unknown_non-water-soluble_silicone');
  });
});

describe('getCategoryGroups', () => {
  test('returns unique group IDs for given category IDs', () => {
    const categoryIds = ['non-water-soluble_silicone', 'water-soluble_silicone', 'sulfates'];
    const groups = getCategoryGroups(testDatabase, categoryIds);

    expect(groups).toEqual(['silicones', 'silicones', 'detergents']);
    // Each group should only appear once after converting to Set
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

