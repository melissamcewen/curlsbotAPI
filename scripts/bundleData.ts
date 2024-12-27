import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Reference } from '../src/types';
import { Analyzer } from '../src/analyzer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');
const CONFIG_DIR = join(__dirname, '../data/config');
const INGREDIENTS_OUTPUT_FILE = join(__dirname, '../src/data/bundledData.ts');
const PRODUCTS_OUTPUT_FILE = join(__dirname, '../src/data/bundledProducts.ts');

function convertToReferenceObjects(refs: (string | Reference)[]): Reference[] {
  return refs.map((ref) => {
    if (typeof ref === 'string') {
      return { url: ref };
    }
    return ref;
  });
}

function generateIdFromName(name: string, country?: string): string {
  const baseId = name.toLowerCase().replace(/\s+/g, '_');
  return country ? `${baseId}_${country.toLowerCase()}` : baseId;
}

function loadIngredientsFromDir(dirPath: string): any {
  const files = readdirSync(dirPath).filter((file) =>
    file.endsWith('.ingredients.json'),
  );
  const allIngredients: any[] = [];

  for (const file of files) {
    const filePath = join(dirPath, file);
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      // Handle both array and object formats
      if (Array.isArray(data.ingredients)) {
        allIngredients.push(...data.ingredients);
      } else {
        allIngredients.push(...Object.values(data.ingredients));
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`JSON parsing error in file ${file}:`);
        console.error(error.message);
        // Show the line where the error occurred if available
        if ('lineNumber' in error) {
          console.error(`Line: ${(error as any).lineNumber}`);
        }
      } else {
        console.error(`Error reading file ${file}:`, error);
      }
      process.exit(1);
    }
  }

  return allIngredients.reduce((acc, ing) => {
    const ingredientName = ing.name || ing.id;
    if (!ingredientName) {
      console.warn(
        `Warning: Ingredient missing both 'name' and 'id' fields:`,
        ing,
      );
      return acc;
    }

    const ingredientId = ing.id || generateIdFromName(ingredientName);
    acc[ingredientId] = {
      ...ing,
      id: ingredientId,
      name: ingredientName,
      categories: ing.categories || [],
      synonyms: ing.synonyms || [],
      references: ing.references
        ? convertToReferenceObjects(ing.references)
        : [],
    };
    return acc;
  }, {});
}

function loadProductsFromDir(dirPath: string): any {
  const files = readdirSync(dirPath).filter((file) =>
    file.endsWith('.products.json'),
  );
  const allProducts: any[] = [];
  const analyzer = new Analyzer();

  for (const file of files) {
    const filePath = join(dirPath, file);
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      if (Array.isArray(data.products)) {
        allProducts.push(...data.products);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`JSON parsing error in file ${file}:`);
        console.error(error.message);
        console.error('File content:', readFileSync(filePath, 'utf-8'));
      } else {
        console.error(`Error reading file ${file}:`, error);
      }
      process.exit(1);
    }
  }

  return allProducts.reduce((acc, product) => {
    // Generate ID from name if name exists, otherwise use existing ID or warn
    const productName = product.name || product.id;
    if (!productName) {
      console.warn(
        `Warning: Product missing both 'name' and 'id' fields:`,
        product,
      );
      return acc;
    }

    const productId = generateIdFromName(productName, product.country);

    // Analyze ingredients if raw ingredients exist
    let status: 'ok' | 'caution' | 'warning' | 'error' | undefined = undefined;
    if (product.ingredients_raw) {
      const analysis = analyzer.analyze(product.ingredients_raw);
      status = analysis.status;
    }

    // Convert cost to cost_rating
    let cost_rating: string | undefined = undefined;
    if (product.cost) {
      if (product.cost <= 15) cost_rating = '1';
      else if (product.cost <= 25) cost_rating = '2';
      else if (product.cost <= 40) cost_rating = '3';
      else if (product.cost <= 60) cost_rating = '4';
      else cost_rating = '5';
    }

    acc[productId] = {
      ...product,
      id: productId,
      name: productName,
      product_categories: product.product_categories || [],
      systems_excluded: product.systems_excluded || [],
      tags: product.tags || [],
      status,
      cost: product.cost,
      cost_rating,
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
  const products = loadProductsFromDir(join(DATA_DIR, 'products'));
  const categoriesData = loadJsonFile(join(DATA_DIR, 'categories.json'));
  const groupsData = loadJsonFile(join(DATA_DIR, 'groups.json'));
  const systemsData = loadJsonFile(join(CONFIG_DIR, 'systems.json'));
  const settingsData = loadJsonFile(join(CONFIG_DIR, 'settings.json'));

  // Convert categories and groups to record format
  const categories = (categoriesData?.categories || []).reduce(
    (acc: any, cat: any) => {
      if (!cat.id) {
        console.warn(`Warning: Category missing required 'id' field:`, cat);
        return acc;
      }
      acc[cat.id] = {
        ...cat, // Keep all original fields
        // Ensure required fields have defaults if missing
        name: cat.name || cat.id,
        description: cat.description || '',
        group: cat.group || 'others',
        references: cat.references
          ? convertToReferenceObjects(cat.references)
          : [],
      };
      return acc;
    },
    {},
  );

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
      defaultIngredient: group.defaultIngredient || undefined,
    };
    return acc;
  }, {});

  const settings = (settingsData?.settings || []).reduce(
    (acc: any, setting: any) => {
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
    },
    {},
  );

  // Generate TypeScript code for ingredients
  const ingredientsCode = `// This file is auto-generated. Do not edit directly.
import type { IngredientDatabase, System, Setting } from '../types';

export const defaultDatabase: IngredientDatabase = ${JSON.stringify(
    { ingredients, categories, groups },
    null,
    2,
  )};

export const defaultSystems: System[] = ${JSON.stringify(
    systemsData?.systems || [],
    null,
    2,
  )};

export const defaultSettings: Record<string, Setting> = ${JSON.stringify(
    settings,
    null,
    2,
  )};

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

  // Generate TypeScript code for products
  const productsCode = `// This file is auto-generated. Do not edit directly.
import type { ProductDatabase } from '../types';

export const defaultProductDatabase: ProductDatabase = ${JSON.stringify(
    { products },
    null,
    2,
  )};

export function getBundledProducts(): ProductDatabase {
  return defaultProductDatabase;
}
`;

  // Write the files
  writeFileSync(INGREDIENTS_OUTPUT_FILE, ingredientsCode);
  writeFileSync(PRODUCTS_OUTPUT_FILE, productsCode);
  console.log(
    `Generated bundled ingredients data at ${INGREDIENTS_OUTPUT_FILE}`,
  );
  console.log(`Generated bundled products data at ${PRODUCTS_OUTPUT_FILE}`);
}

generateBundledData();
