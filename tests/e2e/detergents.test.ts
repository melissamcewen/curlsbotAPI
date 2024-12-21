import { describe, it, expect } from 'vitest';

import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

const list =
  'Sodium Laureth Sulfate, Cocamidopropyl Betaine*, Cocamide MEA, Alkylbenzene Sulfonate, ammonium laureth sulphate, Dioctyl Sodium Sulfosuccinate, some sulfo, sulfate, behentrimonium methosulfate';

describe('Handling of detergents under the default system', () => {
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
      'sodium laureth sulfate',
      'cocamidopropyl betaine',
      'cocamide mea',
      'alkylbenzene sulfonate',
      'ammonium laureth sulphate',
      'dioctyl sodium sulfosuccinate',
      'some sulfo',
      'sulfate',
      'behentrimonium methosulfate'
    ]);
  });

  describe('ingredient matching', () => {
    const expectedResults = [
      {
        normalized: 'sodium laureth sulfate',
        ingredientId: 'sodium_laureth_sulfate',
        category: 'detergents',
        status: 'warning',
        reason: 'sulfate_free'
      },
      {
        normalized: 'cocamidopropyl betaine',
        ingredientId: 'cocamidopropyl_betaine',
        category: 'detergents',
        status: 'ok',
        reason: 'mild_detergents_caution_others'
      },
      {
        normalized: 'cocamide mea',
        ingredientId: 'cocamide_mea',
        category: 'detergents',
        status: 'ok',
        reason: 'mild_detergents_caution_others'
      },
      {
        normalized: 'alkylbenzene sulfonate',
        ingredientId: 'alkylbenzene_sulfonate',
        category: 'detergents',
        status: 'caution',
        reason: 'mild_detergents_caution_others'
      },
      {
        normalized: 'ammonium laureth sulphate',
        ingredientId: 'ammonium_laureth_sulfate',
        category: 'detergents',
        status: 'warning',
        reason: 'sulfate_free'
      },
      {
        normalized: 'dioctyl sodium sulfosuccinate',
        ingredientId: 'dioctyl_sodium_sulfosuccinate',
        category: 'detergents',
        status: 'caution',
        reason: 'mild_detergents_caution_others'
      },
      {
        normalized: 'some sulfo',
        ingredientId: 'unknown_sulfonate',
        category: 'detergents',
        status: 'caution',
        reason: 'mild_detergents_caution_others'
      },
      {
        normalized: 'sulfate',
        ingredientId: 'unknown_sulfate',
        category: 'detergents',
        status: 'warning',
        reason: 'sulfate_free'
      },
      {
        normalized: 'behentrimonium methosulfate',
        ingredientId: 'behentrimonium_methosulfate',
        category: 'others',
        status: 'ok',
        reason: undefined
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
