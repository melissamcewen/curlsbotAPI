import { describe, it, expect } from 'vitest';

import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

const list =
  'Emulsifying Wax NF, beeswax, euphorbia cerifera (candelilla) wax, lonincera japonica (honeysuckle) flower extract';

describe('Handling of waxes under the default system', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    settings: defaultSettings,
  });
  const result = analyzer.analyze(list);
  it('should have a warning status', () => {
    expect(result.status).toBe('warning');
  });

  it('should normalize the list', () => {
    expect(result.ingredients.map((i) => i.normalized)).toEqual([
      'emulsifying wax nf',
      'beeswax',
      'euphorbia cerifera candelilla wax',
      'lonincera japonica honeysuckle flower extract',
    ]);
  });

  describe('ingredient matching', () => {
    const expectedResults = [
      {
        normalized: 'emulsifying wax nf',
        ingredientId: 'emulsifying_wax',
        category: 'water_soluble_waxes',
        status: 'ok',
        reason: undefined,
      },
      {
        normalized: 'beeswax',
        ingredientId: 'beeswax',
        category: 'non_water_soluble_waxes',
        status: 'warning',
        reason: 'no_waxes',
      },
    ];

    expectedResults.forEach((expected) => {
      it(`correctly identifies ${expected.normalized}`, () => {
        const ingredientMatch = result.ingredients.find(
          (i) => i.normalized === expected.normalized,
        );

        expect(ingredientMatch).toBeDefined();
        expect(ingredientMatch?.ingredient?.id).toBe(expected.ingredientId);
        expect(ingredientMatch?.status).toBe(expected.status);
        expect(
          ingredientMatch?.reasons.find((r) => r.setting === expected.reason)
            ?.setting,
        ).toBe(expected.reason);
      });
    });
  });
});
