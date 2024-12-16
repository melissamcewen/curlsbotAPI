import { describe, it, expect } from 'vitest';

import { Analyzer } from '../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

describe('Silicone ingredient analysis', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    systems: defaultSystems,
    settings: defaultSettings,
  });

  describe('System configuration', () => {
    it('should have correct system settings for curly_moderate', () => {
      const result = analyzer.analyze('dimethicone', 'curly_moderate');
      expect(result.system).toBe('curly_moderate');
      expect(result.settings).toContain('no_water_insoluble_silicones');
      expect(result.settings).toContain('caution_water_soluble_silicones');
    });
  });

  describe('Water-insoluble silicones', () => {
    it('should detect dimethicone as a non-water-soluble silicone', () => {
      const result = analyzer.analyze('dimethicone', 'curly_moderate');
      // should match dimethicone
      expect(result.matches[0].normalized).toBe('dimethicone');
      expect(result.matches[0].flags).toContain('non-water-soluble_silicones');
      expect(result.flags.flaggedCategories).toContain('non-water-soluble_silicones');
    });

    it('should detect cyclomethicone as a evaporative silicone', () => {
      const result = analyzer.analyze('cyclomethicone', 'curly_moderate');
      expect(result.matches[0].normalized).toBe('cyclomethicone');
      expect(result.matches[0].categories).toContain('evaporative_silicones');
    });

    it('should detect cetearyl methicone as a non-water-soluble silicone', () => {
      const result = analyzer.analyze('cetearyl methicone', 'curly_moderate');
      expect(result.matches[0].flags).toContain('non-water-soluble_silicones');
      expect(result.flags.flaggedCategories).toContain('non-water-soluble_silicones');
    });

    it('should detect trimethylsiloxysilicate as a non-water-soluble silicone', () => {
      const result = analyzer.analyze('trimethylsiloxysilicate', 'curly_moderate');
      expect(result.matches[0].flags).toContain('non-water-soluble_silicones');
      expect(result.flags.flaggedCategories).toContain('non-water-soluble_silicones');
    });
  });

  describe('Water-soluble silicones', () => {
    it('should detect PEG-8 distearmonium chloride PG-dimethicone as a water-soluble silicone', () => {
      const result = analyzer.analyze('peg-8 distearmonium chloride pg-dimethicone', 'curly_moderate');
      // expect to match a peg silicone of
      expect(result.matches[0].ingredient?.id).toContain('peg');
      expect(result.matches[0].categories).toContain('water-soluble_silicones');
      expect(result.matches[0].flags).toContain('caution');
      expect(result.flags.flaggedCategories).toContain('water-soluble_silicones');
    });

    it('should detect PEG/PPG-18/18 Dimethicone as a water-soluble silicone', () => {
      const result = analyzer.analyze('PEG/PPG-18/18 Dimethicone', 'curly_moderate');
      // should match a peg silicone
      expect(result.matches[0].ingredient?.id).toContain('peg');
      expect(result.matches[0].categories).toContain('water-soluble_silicones');
      expect(result.matches[0].flags).toContain('caution');
      expect(result.flags.flaggedCategories).toContain('water-soluble_silicones');
    });

    it('should detect PEG-12 Dimethicone as a water-soluble silicone', () => {
      const result = analyzer.analyze('PEG-12 Dimethicone', 'curly_moderate');
      expect(result.matches[0].categories).toContain('water-soluble_silicones');
      expect(result.matches[0].flags).toContain('caution');
      expect(result.flags.flaggedCategories).toContain('water-soluble_silicones');
    });

    it('should detect Lauryl PEG/PPG-18/18 Methicone as a water-soluble silicone', () => {
      const result = analyzer.analyze('Lauryl PEG/PPG-18/18 Methicone', 'curly_moderate');
      expect(result.matches[0].categories).toContain('water-soluble_silicones');
      expect(result.matches[0].flags).toContain('caution');
      expect(result.flags.flaggedCategories).toContain('water-soluble_silicones');
    });
  });

  describe('Non-silicone ingredients', () => {
    it('should not flag non-silicone ingredients', () => {
      const result = analyzer.analyze('peg-40 hydrogenated castor oil', 'curly_moderate');
      expect(result.matches[0].flags).toHaveLength(0);
      expect(result.matches[0].categories).not.toContain('water-soluble_silicones');
      expect(result.matches[0].categories).not.toContain('non-water-soluble_silicones');
    });
  });

  describe('Invalid or unknown silicone terms', () => {
    it('should handle generic silicone term', () => {
      const result = analyzer.analyze('silicone', 'curly_moderate');
      const match = result.matches[0];
      expect(match).toBeDefined();
      expect(match.normalized).toBe('silicone');
    });

    it('should handle unknown silicone variations', () => {
      const result = analyzer.analyze('mdimethicon', 'curly_moderate');
      const match = result.matches[0];
      expect(match).toBeDefined();
      expect(match.normalized).toBe('mdimethicon');
    });

    it('should handle silane compounds', () => {
      const result = analyzer.analyze('aminopropyl triethoxysilane', 'curly_moderate');
      const match = result.matches[0];
      expect(match).toBeDefined();
      expect(match.normalized).toBe('aminopropyl triethoxysilane');
    });
  });
});
