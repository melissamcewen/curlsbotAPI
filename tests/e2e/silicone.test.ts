import { describe, it, expect } from 'vitest';

import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

// Find the curly_moderate system from defaultSystems
const moderateSystem = defaultSystems.find(s => s.id === 'curly_moderate');
if (!moderateSystem) {
  throw new Error('Could not find curly_moderate system');
}

const analyzer = new Analyzer({
  database: defaultDatabase,
  system: moderateSystem,
  settings: defaultSettings,
});
const list =
  'peg-8 distearmonium chloride pg-dimethicone, cetearyl methicone, silicone, cyclomethicone, aminopropyl triethoxysilane, PEG/PPG-18/18 Dimethicone, Dimethicone, PEG-12 Dimethicone, silicone, Lauryl PEG / PPG - 18 / 18 Methicone, , triethoxysilane, coney, mdimethicon, peg-40 hydrogenated castor oil, trimethylsiloxysilicate';
const result = analyzer.analyze(list);

describe('Silicone Analysis e2e complex list with curly_moderate system', () => {
  it('should load the system correctly', () => {
    expect(result.status).toBe('warning');
    // Check for non-water-soluble silicones (like dimethicone)
    const nonWaterSolubleReason = result.reasons.find(r => r.setting === 'no_water_insoluble_silicones');
    expect(nonWaterSolubleReason).toBeDefined();
    expect(nonWaterSolubleReason?.reason).toBeDefined();
  });

  it('Should normalize the list correctly', () => {
    expect(result.ingredients.map(i => i.normalized)).toEqual([
      'peg-8 distearmonium chloride pg-dimethicone',
      'cetearyl methicone',
      'silicone',
      'cyclomethicone',
      'aminopropyl triethoxysilane',
      'pegppg-1818 dimethicone',
      'dimethicone',
      'peg-12 dimethicone',
      'silicone',
      'lauryl peg ppg - 18 18 methicone',
      'triethoxysilane',
      'coney',
      'mdimethicon',
      'peg-40 hydrogenated castor oil',
      'trimethylsiloxysilicate',
    ]);
  });
  describe('ingredient matching', () => {
    it('peg-8 distearmonium chloride pg-dimethicone', () => {
      // find the ingredient match for normalized string 'peg-8 distearmonium chloride pg-dimethicone'
      const ingredientMatch = result.ingredients.find(
        (i) => i.normalized === 'peg-8 distearmonium chloride pg-dimethicone',
      );
      expect(ingredientMatch).toBeDefined();
      expect(ingredientMatch?.ingredient?.id).toBe(
        'unknown_water_soluble_silicone',
      );
      // should be flagged caution
      expect(ingredientMatch?.status).toBe('caution');
      // should have a reason for being a water-soluble silicone
      expect(ingredientMatch?.reasons).toContainEqual({
        setting: 'caution_water_soluble_silicones',
        reason: 'Water soluble silicones are marked as caution, other silicones as warning.'
      });
    });
  });
});




