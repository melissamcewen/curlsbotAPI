import { describe, it, expect } from 'vitest';

import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

const list =
  'some sulfate';

describe('Handling of surfactants under the default system', () => {
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
      'some sulfate',
    ]);
  });

  describe('ingredient matching', () => {
    const expectedResults = [
      {
        normalized: 'some sulfate',
        ingredientId: 'unknown_sulfate',
        category: 'surfactants',
        status: 'warning',
        reason: 'sulfate_free'
      }
    ];

    expectedResults.forEach((expected) => {
      it(`correctly identifies ${expected.normalized}`, () => {
        const ingredientMatch = result.ingredients.find(
          (i) => i.normalized === expected.normalized,
        );

        expect(ingredientMatch).toBeDefined();
        expect(ingredientMatch?.ingredient?.id).toBe(expected.ingredientId);
        expect(ingredientMatch?.ingredient?.group).toBe(expected.category);
        expect(ingredientMatch?.status).toBe(expected.status);
        expect(
          ingredientMatch?.reasons.find((r) => r.setting === expected.reason)
            ?.setting,
        ).toBe(expected.reason);
      });
    });
  });
});
