import { join } from 'path';
import { readFileSync } from 'fs';
import type { Settings, System } from '../../src/types';

interface LoadConfigOptions {
  configDir: string;
}

export function loadSettings({ configDir }: LoadConfigOptions): Settings {
  try {
    const settingsPath = join(configDir, 'settings.json');
    return JSON.parse(readFileSync(settingsPath, 'utf-8')).settings;
  } catch (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }
}

export function loadSystems({ configDir }: LoadConfigOptions): System[] {
  try {
    const systemsPath = join(configDir, 'systems.json');
    return JSON.parse(readFileSync(systemsPath, 'utf-8')).systems;
  } catch (error) {
    throw new Error(`Failed to load systems: ${error.message}`);
  }
}
