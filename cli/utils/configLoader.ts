import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

import type { System, Setting, Settings } from '../../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_DIR = join(__dirname, '../../src/config');

interface ConfigLoaderOptions {
  configDir?: string;
}

/**
 * Loads systems configuration from systems.json
 */
export function loadSystems(options: ConfigLoaderOptions = {}): System[] {
  try {
    const configDir = options.configDir || DEFAULT_CONFIG_DIR;
    const systemsPath = join(configDir, 'systems.json');
    const systemsData = JSON.parse(readFileSync(systemsPath, 'utf-8'));
    return systemsData.systems;
  } catch (error) {
    console.error('Error loading systems:', error);
    return [];
  }
}

/**
 * Loads settings configuration from settings.json
 */
export function loadSettings(options: ConfigLoaderOptions = {}): Settings {
  try {
    const configDir = options.configDir || DEFAULT_CONFIG_DIR;
    const settingsPath = join(configDir, 'settings.json');
    const settingsData = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    return settingsData.settings.reduce((acc: Settings, setting: Setting) => {
      acc[setting.id] = setting;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
}

/**
 * Gets flags for a specific setting
 */
export function getSettingFlags(settingId: string, options: ConfigLoaderOptions = {}): {
  ingredients: string[];
  categories: string[];
  flags: string[];
} {
  const settings = loadSettings(options);
  const setting = settings[settingId];
  if (!setting) {
    return {
      ingredients: [],
      categories: [],
      flags: []
    };
  }

  return {
    ingredients: setting.ingredients || [],
    categories: setting.categories || [],
    flags: setting.flags || []
  };
}
