import { describe, it, expect } from 'vitest';

import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';
import {
  findIngredient,
  partitionSearchSpace,
  findCategoryByInclusion,
  findGroupByInclusion,
} from '../../src/utils/databaseUtils';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

const list = 'peg-12 carnauba wax';

describe('Debugging ingredient matching', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    settings: defaultSettings,
  });

  it('should correctly identify peg-12 carnauba wax', () => {
    // Log the initial search
    console.log('\nSearching for:', list);

    // Check partitioning
    const partitioned = partitionSearchSpace(defaultDatabase, list);
    console.log(
      '\nPartitioned database categories:',
      Object.keys(partitioned.database.categories),
    );
    console.log('Default ingredient:', partitioned.defaultIngredient);

    // Check category and group matching
    const categoryMatch = findCategoryByInclusion(
      defaultDatabase.categories,
      defaultDatabase.groups,
      list,
    );
    console.log('\nCategory match:', categoryMatch);

    const groupMatch = findGroupByInclusion(defaultDatabase.groups, list);
    console.log('Group match:', groupMatch);

    // Check ingredient matching
    const ingredientMatch = findIngredient(defaultDatabase, list);
    console.log(
      '\nIngredient match:',
      JSON.stringify(ingredientMatch, null, 2),
    );

    // Run the analyzer
    const result = analyzer.analyze(list);
    console.log('\nFinal analysis result:', JSON.stringify(result, null, 2));

    // Test assertions
    expect(result.ingredients[0].ingredient?.id).toBe('peg_12_carnauba_wax');
    expect(result.ingredients[0].ingredient?.categories).toContain(
      'water_soluble_waxes',
    );
  });
});
