import { describe, expect, it } from 'vitest';

import { Analyzer } from '../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../src/data/bundledData';

describe('Wax ingredient analysis', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    systems: defaultSystems,
    settings: defaultSettings,
  });

  describe('Non-water-soluble waxes', () => {
    it('should detect beeswax as a non-water-soluble wax', () => {
      const result = analyzer.analyze('beeswax', 'curly_default');
      const match = result.matches[0];
      expect(match.categories).toContain('non_water_soluble_waxes');
      expect(match.flags).toContain('waxes');
    });

    it('should detect candelilla wax as a non-water-soluble wax', () => {
      const result = analyzer.analyze(
        'euphorbia cerifera wax',
        'curly_default',
      );
      const match = result.matches[0];
      expect(match.categories).toContain('non_water_soluble_waxes');
      expect(match.flags).toContain('waxes');
    });

    it('should flag waxes category when non-water-soluble waxes are found', () => {
      const result = analyzer.analyze(
        'beeswax, euphorbia cerifera wax',
        'curly_default',
      );
      expect(result.flags.flaggedCategories).toContain('waxes');
    });
  });

  describe('Water-soluble waxes', () => {
    it('should detect emulsifying wax NF as a water-soluble wax', () => {
      const result = analyzer.analyze('emulsifying wax NF', 'curly_default');
      const match = result.matches[0];
      expect(match.categories).toContain('water_soluble_waxes');
      expect(match.flags).not.toContain('waxes');
    });

    it('should not flag waxes category for water-soluble waxes', () => {
      const result = analyzer.analyze('emulsifying wax NF', 'curly_default');
      expect(result.flags.flaggedCategories).not.toContain('waxes');
    });
  });
});
