import { describe, it, expect, beforeEach } from 'vitest';
import { getDefaultDatabase, getFallbackDatabase, clearDefaultDatabase, clearFallbackDatabase } from '../../src/data/defaultDatabase';

describe('Database loading functions', () => {
  beforeEach(() => {
    clearDefaultDatabase();
    clearFallbackDatabase();
  });

  describe('getDefaultDatabase', () => {
    it('returns a database with ingredients, categories, and groups', () => {
      const db = getDefaultDatabase();
      expect(db).toBeDefined();
      expect(db.ingredients).toBeDefined();
      expect(db.categories).toBeDefined();
      expect(db.groups).toBeDefined();
    });

    it('returns the same instance on subsequent calls', () => {
      const db1 = getDefaultDatabase();
      const db2 = getDefaultDatabase();
      expect(db1).toBe(db2);
    });
  });

  describe('getFallbackDatabase', () => {
    it('returns a database with ingredients, categories, and groups', () => {
      const db = getFallbackDatabase();
      expect(db).toBeDefined();
      expect(db.ingredients).toBeDefined();
      expect(db.categories).toBeDefined();
      expect(db.groups).toBeDefined();
    });

    it('returns the same instance on subsequent calls', () => {
      const db1 = getFallbackDatabase();
      const db2 = getFallbackDatabase();
      expect(db1).toBe(db2);
    });

    it('contains fallback ingredients', () => {
      const db = getFallbackDatabase();
      // Check for a known fallback ingredient
      const silicones = db.ingredients['unknown_non_water_soluble_silicones'];
      expect(silicones).toBeDefined();
      expect(silicones.name).toBe('Unknown Non-Water Soluble Silicones');
      expect(silicones.categories).toContain('non-water-soluble_silicones');
      expect(silicones.synonyms).toContain('cone');
    });
  });

  describe('clearDefaultDatabase and clearFallbackDatabase', () => {
    it('clears the cached default database', () => {
      const db1 = getDefaultDatabase();
      clearDefaultDatabase();
      const db2 = getDefaultDatabase();
      expect(db1).not.toBe(db2);
    });

    it('clears the cached fallback database', () => {
      const db1 = getFallbackDatabase();
      clearFallbackDatabase();
      const db2 = getFallbackDatabase();
      expect(db1).not.toBe(db2);
    });
  });
});
