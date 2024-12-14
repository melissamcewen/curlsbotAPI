import { join } from 'path';
import { describe, it, expect, beforeEach } from 'vitest';
import { getDefaultDatabase, getFallbackDatabase, clearDefaultDatabase, clearFallbackDatabase } from '../../src/data/defaultDatabase';

const TEST_DATA_DIR = join(__dirname, '../fixtures/data');
const TEST_FALLBACK_DIR = join(__dirname, '../fixtures/data/fallback');

describe('Database loading functions', () => {
  beforeEach(() => {
    clearDefaultDatabase();
    clearFallbackDatabase();
  });

  describe('getDefaultDatabase', () => {
    it('returns a database with ingredients, categories, and groups', () => {
      const db = getDefaultDatabase(TEST_DATA_DIR);
      expect(db).toBeDefined();
      expect(db.ingredients).toBeDefined();
      expect(db.categories).toBeDefined();
      expect(db.groups).toBeDefined();
    });

    it('returns the same instance on subsequent calls', () => {
      const db1 = getDefaultDatabase(TEST_DATA_DIR);
      const db2 = getDefaultDatabase(TEST_DATA_DIR);
      expect(db1).toBe(db2);
    });

    it('loads test data correctly', () => {
      const db = getDefaultDatabase(TEST_DATA_DIR);
      expect(db.categories).toBeDefined();
      expect(db.categories['non-water-soluble_silicones']).toBeDefined();
      expect(db.categories['non-water-soluble_silicones'].name).toBe('Non-water-soluble Silicones');
      expect(db.categories['non-water-soluble_silicones'].group).toBe('silicones');

      expect(db.groups).toBeDefined();
      expect(db.groups['alcohols']).toBeDefined();
      expect(db.groups['alcohols'].name).toBe('Alcohols');
    });
  });

  describe('getFallbackDatabase', () => {
    it('returns a database with ingredients, categories, and groups', () => {
      const db = getFallbackDatabase(TEST_FALLBACK_DIR, TEST_DATA_DIR);
      expect(db).toBeDefined();
      expect(db.ingredients).toBeDefined();
      expect(db.categories).toBeDefined();
      expect(db.groups).toBeDefined();
    });

    it('returns the same instance on subsequent calls', () => {
      const db1 = getFallbackDatabase(TEST_FALLBACK_DIR, TEST_DATA_DIR);
      const db2 = getFallbackDatabase(TEST_FALLBACK_DIR, TEST_DATA_DIR);
      expect(db1).toBe(db2);
    });

    it('contains fallback ingredients', () => {
      const db = getFallbackDatabase(TEST_FALLBACK_DIR, TEST_DATA_DIR);
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
      const db1 = getDefaultDatabase(TEST_DATA_DIR);
      clearDefaultDatabase();
      const db2 = getDefaultDatabase(TEST_DATA_DIR);
      expect(db1).not.toBe(db2);
    });

    it('clears the cached fallback database', () => {
      const db1 = getFallbackDatabase(TEST_FALLBACK_DIR, TEST_DATA_DIR);
      clearFallbackDatabase();
      const db2 = getFallbackDatabase(TEST_FALLBACK_DIR, TEST_DATA_DIR);
      expect(db1).not.toBe(db2);
    });
  });
});
