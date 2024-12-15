import { describe, it, expect } from 'vitest';

import { Analyzer } from '../src/analyzer';
import {
  defaultDatabase,
  defaultFallbackDatabase,
  defaultSystems,
  defaultSettings,
} from '../src/data/bundledData';

/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

describe('Fallback Database E2E Tests', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    fallbackDatabase: defaultFallbackDatabase,
    systems: defaultSystems,
    settings: defaultSettings,
  });

  describe('Unknown Silicones', () => {
    it('should detect unknown non-water soluble silicones', () => {
      const result = analyzer.analyze('siloxane');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_non_water_soluble_silicones');
      expect(match.categories).toContain('non-water-soluble_silicones');
    });

    it('should detect unknown water soluble silicones', () => {
      const result = analyzer.analyze('peg-dimethicone');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_water_soluble_silicones');
      expect(match.categories).toContain('water-soluble_silicones');
    });
  });

  describe('Unknown Sulfates', () => {
    it('should detect unknown sulfates', () => {
      const result = analyzer.analyze('sulphate');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_sulfates');
      expect(match.categories).toContain('sulfates');
    });

    it('should detect unknown cocoyl sulfates', () => {
      const result = analyzer.analyze('coco-sulfate');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_cocoyl_sulfates');
      expect(match.categories).toContain('sulfates');
    });

    it('should detect unknown sodium lauryl sulfates', () => {
      const result = analyzer.analyze('sodium lauryl');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_sodium_lauryl_sulfates');
      expect(match.categories).toContain('sulfates');
    });

    it('should detect unknown sodium laureth sulfates', () => {
      const result = analyzer.analyze('sodium laureth');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_sodium_laureth_sulfates');
      expect(match.categories).toContain('sulfates');
    });
  });

  describe('Unknown Detergents', () => {
    it('should detect unknown sarcosinate', () => {
      const result = analyzer.analyze('sarcosinate');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_sarcosinate');
      expect(match.categories).toContain('other_detergents');
    });

    it('should detect unknown cocoyl glutamate', () => {
      const result = analyzer.analyze('cocoyl glutamate');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_cocoyl_glutamate');
      expect(match.categories).toContain('other_detergents');
    });
  });

  describe('Unknown Waxes', () => {
    it('should detect unknown wax', () => {
      const result = analyzer.analyze('wax');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_wax');
      expect(match.categories).toContain('non-water-soluble_waxes');
    });
  });

  describe('Fallback Priority', () => {
    it('should prefer main database over fallback', () => {
      // This ingredient exists in both databases, should use main
      const result = analyzer.analyze('dimethicone');
      const match = result.matches[0];
      expect(match.ingredient?.id).not.toBe('unknown_non_water_soluble_silicones');
      expect(match.categories).toContain('non-water-soluble_silicones');
    });

    it('should use fallback when not in main', () => {
      // This should only exist in fallback
      const result = analyzer.analyze('siloxane');
      const match = result.matches[0];
      expect(match.ingredient?.id).toBe('unknown_non_water_soluble_silicones');
      expect(match.categories).toContain('non-water-soluble_silicones');
    });
  });
});
