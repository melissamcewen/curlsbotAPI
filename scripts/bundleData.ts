import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');
const CONFIG_DIR = join(__dirname, '../data/config');
const OUTPUT_FILE = join(__dirname, '../src/data/bundledData.ts');

function loadIngredientsFromDir(dirPath: string): any {
  const files = readdirSync(dirPath).filter(file => file.endsWith('.ingredients.json'));
  const allIngredients: any[] = [];

  for (const file of files) {
    const filePath = join(dirPath, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    // Handle both array and object formats
    if (Array.isArray(data.ingredients)) {
      allIngredients.push(...data.ingredients);
    } else {
      allIngredients.push(...Object.values(data.ingredients));
    }
  }

  return allIngredients.reduce((acc, ing) => {
    if (!ing.id) {
      console.warn(`Warning: Ingredient missing required 'id' field:`, ing);
      return acc;
    }
    acc[ing.id] = {
      ...ing, // Keep all original fields
      // Ensure required fields have defaults if missing
      name: ing.name || ing.id,
      categories: ing.categories || [],
      synonyms: ing.synonyms || [],
      references: ing.references || []
    };
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
    if (!cat.id) {
      console.warn(`Warning: Category missing required 'id' field:`, cat);
      return acc;
    }
    acc[cat.id] = {
      ...cat, // Keep all original fields
      // Ensure required fields have defaults if missing
      name: cat.name || cat.id,
      description: cat.description || '',
      group: cat.group || 'others'
    };
    return acc;
  }, {});

  const groups = (groupsData?.groups || []).reduce((acc: any, group: any) => {
    if (!group.id) {
      console.warn(`Warning: Group missing required 'id' field:`, group);
      return acc;
    }
    acc[group.id] = {
      ...group, // Keep all original fields
      // Ensure required fields have defaults if missing
      name: group.name || group.id,
      inclusions: group.inclusions || [],
      defaultIngredient: group.defaultIngredient || undefined
    };
    return acc;
  }, {});

  const settings = (settingsData?.settings || []).reduce((acc: any, setting: any) => {
    // Ensure required fields exist
    if (!setting.id) {
      console.warn(`Warning: Setting missing required 'id' field:`, setting);
      return acc;
    }
    // Preserve original structure but ensure required fields
    acc[setting.id] = {
      ...setting, // Keep all original fields
      // Ensure required fields have defaults if missing
      name: setting.name || setting.id,
      description: setting.description || '',
    };
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
