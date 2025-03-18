import { describe, it, expect } from 'vitest';

import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

const list = `some essential oil, sulfated castor oil, cetearyl
alcohol, Isopropanolamine`;

describe('Handling of other ingredients under the default system', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    settings: defaultSettings,
  });
  const result = analyzer.analyze(list);
  it('should have a ok status', () => {
    expect(result.status).toBe('ok');
  });

  it('should normalize the list', () => {
    expect(result.ingredients.map((i) => i.normalized)).toEqual([
      'some essential oil',
      'sulfated castor oil',
      'cetearyl alcohol',
      'isopropanolamine',
    ]);
  });

  describe('ingredient matching', () => {
    const expectedResults = [
      {
        normalized: 'some essential oil',
        ingredientId: 'unknown_essential_oil',
        category: 'essential_oils',
        status: 'ok',
        reason: undefined,
      },
      {
        normalized: 'sulfated castor oil',
        ingredientId: 'sulfated_castor_oil',
        category: 'light_oils',
        status: 'ok',
        reason: undefined,
      },
      {
        normalized: 'cetearyl alcohol',
        ingredientId: 'cetearyl_alcohol',
        category: 'emollient_alcohols',
        status: 'ok',
      },
      {
        normalized: 'isopropanolamine',
        ingredientId: 'isopropanolamine',
        category: 'other',
        status: 'ok',
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
