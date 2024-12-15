import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../src/data');
const CONFIG_DIR = join(__dirname, '../src/config');
const SCHEMA_DIR = join(DATA_DIR, 'schema');
const OUTPUT_FILE = join(DATA_DIR, 'bundledData.ts');

function loadIngredientsFromDir(dirPath: string): any {
  const files = readdirSync(dirPath).filter(file => file.endsWith('.ingredients.json'));
  const allIngredients: any[] = [];

  for (const file of files) {
    const filePath = join(dirPath, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    allIngredients.push(...data.ingredients);
  }

  return allIngredients.reduce((acc, ing) => {
    acc[ing.id] = ing;
    return acc;
  }, {});
}

function loadJsonFile(filePath: string): any {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function generateBundledData() {
  // Load all data
  const ingredients = loadIngredientsFromDir(join(DATA_DIR, 'ingredients'));
  const categoriesData = loadJsonFile(join(DATA_DIR, 'categories.json'));
  const groupsData = loadJsonFile(join(DATA_DIR, 'groups.json'));
  const systemsData = loadJsonFile(join(CONFIG_DIR, 'systems.json'));
  const settingsData = loadJsonFile(join(CONFIG_DIR, 'settings.json'));

  // Convert categories and groups to record format
  const categories = (categoriesData?.categories || []).reduce((acc: any, cat: any) => {
    acc[cat.id] = cat;
    return acc;
  }, {});

  const groups = (groupsData?.groups || []).reduce((acc: any, group: any) => {
    acc[group.id] = group;
    return acc;
  }, {});

  const settings = (settingsData?.settings || []).reduce((acc: any, setting: any) => {
    acc[setting.id] = setting;
    return acc;
  }, {});

  // Generate TypeScript code
  const code = `// This file is auto-generated. Do not edit directly.
import type { IngredientDatabase, System, Setting } from '../types';

export const defaultDatabase: IngredientDatabase = ${JSON.stringify({ ingredients, categories, groups }, null, 2)};

export const defaultSystems: System[] = ${JSON.stringify(systemsData?.systems || [], null, 2)};

export const defaultSettings: Record<string, Setting> = ${JSON.stringify(settings, null, 2)};

export function getBundledDatabase(): IngredientDatabase {
  return defaultDatabase;
}

export function getBundledSystems(): System[] {
  return defaultSystems;
}

export function getBundledSettings(): Record<string, Setting> {
  return defaultSettings;
}
`;

  // Write the file
  writeFileSync(OUTPUT_FILE, code);
  console.log(`Generated bundled data at ${OUTPUT_FILE}`);
}

generateBundledData();
