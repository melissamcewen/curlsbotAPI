import { join } from 'path';
import { describe, it, expect } from 'vitest';

import { loadSystems, loadSettings, getSettingFlags } from '../../src/utils/configLoader';
import { validateSettingsAndSystems } from '../../src/utils/validation';
import { loadDatabase } from '../../src/utils/dataLoader';

const TEST_CONFIG_DIR = join(__dirname, '../fixtures/config');
const TEST_DATA_DIR = join(__dirname, '../fixtures/data');
const TEST_SCHEMA_DIR = join(__dirname, '../../src/data/schema');
const TEST_DIR = join(TEST_CONFIG_DIR, 'test');

describe('configLoader', () => {
  describe('loadSystems', () => {
    it('should load systems from config file', () => {
      const systems = loadSystems({ configDir: TEST_CONFIG_DIR });
      expect(systems).toHaveLength(2);
      expect(systems[0].id).toBe('curly_default');
      expect(systems[1].id).toBe('no_poo');
    });

    it('should return empty array when config directory does not exist', () => {
      const systems = loadSystems({ configDir: 'nonexistent' });
      expect(systems).toEqual([]);
    });
  });

  describe('loadSettings', () => {
    it('should load settings from config file', () => {
      const settings = loadSettings({ configDir: TEST_CONFIG_DIR });
      expect(settings.sulfate_free).toBeDefined();
      expect(settings.sulfate_free.name).toBe('Sulfate Free');
      expect(settings.silicone_free).toBeDefined();
      expect(settings.minimal_setting).toBeDefined();
    });

    it('should return empty object when config directory does not exist', () => {
      const settings = loadSettings({ configDir: 'nonexistent' });
      expect(settings).toEqual({});
    });
  });

  describe('getSettingFlags', () => {
    it('should get flags for a valid setting', () => {
      const flags = getSettingFlags('sulfate_free', { configDir: TEST_CONFIG_DIR });
      expect(flags).toEqual({
        ingredients: ['sls', 'sodium_lauryl_sulfate'],
        categories: ['sulfates'],
        flags: ['avoid_sulfates']
      });
    });

    it('should return empty arrays for unknown setting', () => {
      const flags = getSettingFlags('unknown_setting', { configDir: TEST_CONFIG_DIR });
      expect(flags).toEqual({
        ingredients: [],
        categories: [],
        flags: []
      });
    });

    it('should handle missing flag arrays', () => {
      const flags = getSettingFlags('minimal_setting', { configDir: TEST_CONFIG_DIR });
      expect(flags).toEqual({
        ingredients: [],
        categories: [],
        flags: []
      });
    });
  });

  describe('validateSettingsAndSystems', () => {
    it('should validate valid settings and systems', () => {
      const database = loadDatabase({ dataDir: TEST_DATA_DIR, schemaDir: TEST_SCHEMA_DIR });
      const errors = validateSettingsAndSystems(database, TEST_DIR);
      expect(errors).toContain('❌ Invalid setting "nonexistent_setting" referenced by system "Test System"');
      expect(errors).toContain('❌ Invalid ingredient "nonexistent_ingredient" referenced by setting "Test Setting"');
      expect(errors).toContain('❌ Invalid category "nonexistent_category" referenced by setting "Test Setting"');
    });
  });
});
