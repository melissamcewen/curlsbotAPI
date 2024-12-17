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
const result = analyzer.analyze(list, 'curly_moderate');

describe('Silicone Analysis e2e complex list with curly_moderate system', () => {
  it('should load the system correctly', () => {
    expect(result.system).toBe('curly_moderate');
    expect(result.status).not.toBe('error');
    expect(result.settings).toContain('no_water_insoluble_silicones');
    expect(result.settings).toContain('caution_water_soluble_silicones');
  });

  it('Should normalize the list correctly', () => {
    expect(result.normalized).toEqual([
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
      const ingredientMatch = result.matches.find(
        (m) => m.normalized === 'peg-8 distearmonium chloride pg-dimethicone',
      );
      console.log(ingredientMatch);
      expect(ingredientMatch).toBeDefined();
      expect(ingredientMatch?.ingredient?.id).toBe(
        'unknown_water_soluble_silicone',
      );
      // should be flagged caution
      expect(ingredientMatch?.flags).toContain('caution');
    });
  });
});




