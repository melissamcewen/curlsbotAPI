import { describe, it, expect } from 'vitest';
import { Analyzer } from '../../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../../src/data/bundledData';

describe('Silicone ingredient analysis', () => {
  it('should detect various silicone ingredients', () => {
    const analyzer = new Analyzer({
      database: defaultDatabase,
      systems: defaultSystems,
      settings: defaultSettings,
    });

    const ingredientList =
      'peg-8 distearmonium chloride pg-dimethicone, cetearyl methicone, silicone, cyclomethicone, aminopropyl triethoxysilane, PEG/PPG-18/18 Dimethicone, Dimethicone, PEG-12 Dimethicone, silicone, Lauryl PEG / PPG - 18 / 18 Methicone, , triethoxysilane, coney, mdimethicon, peg-40 hydrogenated castor oil, trimethylsiloxysilicate';

    const result = analyzer.analyze(ingredientList, 'curly_moderate');

    // Log the matches for debugging
    console.log(
      'Silicone matches:',
      result.matches.filter((m) => m.flags.length > 0),
    );

    // Verify system and settings
    expect(result.system).toBe('curly_moderate');
    expect(result.settings).toContain('no_water_insoluble_silicones');
    expect(result.settings).toContain('caution_water_soluble_silicones');

    // Verify water-insoluble silicones are marked as avoid
    const waterInsolubleSilicones = result.matches.filter(
      (m) =>
        m.flags.includes('non-water-soluble_silicones') ||
        m.flags.includes('avoid_non_water_soluble_silicones'),
    );
    expect(waterInsolubleSilicones.map((m) => m.normalized)).toEqual(
      expect.arrayContaining([
        'dimethicone',
        'cyclomethicone',
        'cetearyl methicone',
        'trimethylsiloxysilicate',
      ]),
    );

    // Verify water-soluble silicones are marked as caution
    const waterSolubleSilicones = result.matches.filter(
      (m) =>
        m.flags.includes('water-soluble_silicones') ||
        m.flags.includes('caution_water_soluble_silicones'),
    );

    // Check that we found the expected water-soluble silicones
    const expectedWaterSoluble = [
      'peg-8 distearmonium chloride pg-dimethicone',
      'peg/ppg-18/18 dimethicone',
      'peg-12 dimethicone',
      'lauryl peg/ppg-18/18 methicone',
    ];
    expect(waterSolubleSilicones.map((m) => m.normalized)).toEqual(
      expect.arrayContaining(expectedWaterSoluble),
    );

    // Verify each water-soluble silicone is flagged as caution
    waterSolubleSilicones.forEach((match) => {
      expect(match.flags).toContain('caution');
      expect(match.categories).toContain('water-soluble_silicones');
    });

    // Verify that silicones are in the flagged categories
    expect(result.flags.flaggedCategories).toContain(
      'non-water-soluble_silicones',
    );
    expect(result.flags.flaggedCategories).toContain('water-soluble_silicones');

    // Verify that non-silicone ingredients are not flagged
    expect(
      result.matches.find(
        (m) => m.normalized === 'peg-40 hydrogenated castor oil',
      )?.flags,
    ).toHaveLength(0);
  });
});
