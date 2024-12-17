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

describe('Silicone Analysis Tests', () => {
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
});



