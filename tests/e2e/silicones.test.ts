import { describe, it, expect } from 'vitest';

import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

// Find the curly_moderate system from defaultSystems
const moderateSystem = defaultSystems.find((s) => s.id === 'curly_moderate');
if (!moderateSystem) {
  throw new Error('Could not find curly_moderate system');
}

const analyzer = new Analyzer({
  database: defaultDatabase,
  system: moderateSystem,
  settings: defaultSettings,
});
const list =
  'peg-8 distearmonium chloride pg-dimethicone, cetearyl methicone, silicone, cyclomethicone, aminopropyl triethoxysilane, PEG/PPG-18/18 Dimethicone, Dimethicone, PEG-12 Dimethicone, silicone, Lauryl PEG / PPG - 18 / 18 Methicone, , triethoxysilane, coney, mdimethicon, peg-40 hydrogenated castor oil, trimethylsiloxysilicate, saccharomycessilicon, Peg-40 castor oil, peg-100 Something, quaternium- 95, Hydrolyzed Wheat Protein PG-Propyl Silanetriol,  Something PG-Silanetriol';
const result = analyzer.analyze(list);

describe('Silicone Analysis e2e complex list with curly_moderate system', () => {
  it('should load the system correctly', () => {
    expect(result.status).toBe('warning');
    // Check for non-water-soluble silicones (like dimethicone)
    const nonWaterSolubleReason = result.reasons.find(
      (r) => r.setting === 'no_water_insoluble_silicones',
    );
    expect(nonWaterSolubleReason).toBeDefined();
    expect(nonWaterSolubleReason?.reason).toBeDefined();

    // Check for caution silicones reason
    const cautionSiliconesReason = result.reasons.find(
      (r) => r.setting === 'caution_silicones',
    );
    expect(cautionSiliconesReason).toBeDefined();
    expect(cautionSiliconesReason?.reason).toBeDefined();
  });

  it('overall analysis should have a warning status', () => {
    expect(result.status).toBe('warning');
  });

  it('Should normalize the list correctly', () => {
    expect(result.ingredients.map((i) => i.normalized)).toEqual([
      'peg-8 distearmonium chloride pg-dimethicone',
      'cetearyl methicone',
      'silicone',
      'cyclomethicone',
      'aminopropyl triethoxysilane',
      'peg ppg-18 18 dimethicone',
      'dimethicone',
      'peg-12 dimethicone',
      'silicone',
      'lauryl peg ppg - 18 18 methicone',
      'triethoxysilane',
      'coney',
      'mdimethicon',
      'peg-40 hydrogenated castor oil',
      'trimethylsiloxysilicate',
      'saccharomycessilicon',
      'peg-40 castor oil',
      'peg-100 something',
      'quaternium- 95',
      'hydrolyzed wheat protein pg-propyl silanetriol',
      'something pg-silanetriol'
    ]);
  });
  describe('ingredient matching', () => {
    const expectedResults = [
      {
        normalized: 'peg-8 distearmonium chloride pg-dimethicone',
        ingredientId: 'unknown_water_soluble_silicone',
        category: 'water_soluble_silicones',
        status: 'caution',
        reason: 'caution_silicones',
      },
      {
        normalized: 'cetearyl methicone',
        ingredientId: 'cetearyl_methicone',
        category: 'non_water_soluble_silicones',
        status: 'warning',
        reason: 'no_water_insoluble_silicones',
      },
      {
        normalized: 'silicone',
        ingredientId: 'unknown_non_water_soluble_silicone',
        category: 'non_water_soluble_silicones',
        status: 'warning',
        reason: 'no_water_insoluble_silicones',
      },
      {
        normalized: 'cyclomethicone',
        ingredientId: 'cyclomethicone',
        category: 'evaporative_silicones',
        status: 'caution',
        reason: 'caution_silicones',
      },
      {
        normalized: 'peg ppg-18 18 dimethicone',
        ingredientId: 'unknown_water_soluble_silicone',
        category: 'water_soluble_silicones',
        status: 'caution',
        reason: 'caution_silicones',
      },
      {
        normalized: 'peg-12 dimethicone',
        ingredientId: 'peg_12_dimethicone',
        category: 'water_soluble_silicones',
        status: 'caution',
        reason: 'caution_silicones',
      },
      {
        normalized: 'lauryl peg ppg - 18 18 methicone',
        ingredientId: 'unknown_water_soluble_silicone',
        category: 'water_soluble_silicones',
        status: 'caution',
        reason: 'caution_silicones',
      },
      {
        normalized: 'trimethylsiloxysilicate',
        ingredientId: 'trimethylsiloxysilicate',
        category: 'non_water_soluble_silicones',
        status: 'warning',
        reason: 'no_water_insoluble_silicones',
      },
      {
        normalized: 'saccharomycessilicon',
        ingredientId: 'saccharomyces_silicon_ferment',
        category: 'other',
        status: 'ok',
        reason: undefined,
      },
      {
        normalized: 'peg-40 castor oil',
        ingredientId: 'castor_oil',
        category: 'medium_oils',
        status: 'ok',
        reason: undefined,
      },
      {
        normalized: 'peg-100 something',
        ingredientId: undefined,
        category: undefined,
        status: 'ok',
        reason: undefined,
      },
      {
        normalized: 'quaternium- 95',
        ingredientId: undefined,
        category: undefined,
        status: 'ok',
        reason: undefined,
      },
      {
        normalized: 'hydrolyzed wheat protein pg-propyl silanetriol',
        ingredientId: 'hydrolyzed_vegetable_protein_pg_propyl_silanetriol',
        category: 'water_soluble_silicones',
        status: 'caution',
        reason: 'caution_silicones',
      },
      {
        normalized: 'something pg-silanetriol',
        ingredientId: 'unknown_water_soluble_silicone',
        category: 'water_soluble_silicones',
        status: 'caution',
        reason: 'caution_silicones',
      },

    ];

    expectedResults.forEach((expected) => {
      it(`correctly identifies ${expected.normalized}`, () => {
        const ingredientMatch = result.ingredients.find(
          (i) => i.normalized === expected.normalized,
        );

        expect(ingredientMatch).toBeDefined();
        expect(ingredientMatch?.ingredient?.id).toBe(expected.ingredientId);

        if (expected.category) {
          expect(ingredientMatch?.ingredient?.categories).toEqual(
            expect.arrayContaining([expected.category])
          );
        } else {
          // For ingredients with no categories, either categories should be undefined or an empty array
          expect(ingredientMatch?.ingredient?.categories).toBeFalsy();
        }

        expect(ingredientMatch?.status).toBe(expected.status);
        expect(
          ingredientMatch?.reasons.find((r) => r.setting === expected.reason)
            ?.setting,
        ).toBe(expected.reason);
      });
    });
  });
});
