import { describe, it, expect } from 'vitest';
import { Analyzer } from '../../src/analyzer';
import { testDatabase } from '../fixtures/testDatabase';

describe('Analyzer Unit Tests', () => {
  describe('Input Handling', () => {
    it('should handle empty input', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('');

      expect(result.normalized).toEqual([]);
      expect(result.matches).toEqual([]);
      expect(result.categories).toEqual([]);
      expect(result.groups).toEqual([]);
    });

    it('should handle invalid URLs', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('http://example.com/ingredients');

      expect(result.normalized).toEqual([]);
      expect(result.matches).toEqual([]);
    });

    it('should handle ingredients with parentheses', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol (Emollient), SD Alcohol (Drying)');

      expect(result.normalized).toEqual(['cetyl alcohol', 'sd alcohol']);
      expect(result.matches).toHaveLength(2);
    });

    it('should handle ingredients with different separators', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol | SD Alcohol & Water');

      expect(result.normalized).toHaveLength(3);
      expect(result.matches).toHaveLength(3);
    });

    it('should handle ingredients with line breaks and spaces', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol\nSD Alcohol\r\n  Water  ');

      expect(result.matches).toHaveLength(3);
    });
  });

  describe('UUID Generation', () => {
    it('should generate unique UUIDs for each match', () => {
      const analyzer = new Analyzer({ database: testDatabase });
      const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

      const uuids = new Set(result.matches.map(m => m.uuid));
      expect(uuids.size).toBe(2); // All UUIDs should be unique
    });
  });
});
