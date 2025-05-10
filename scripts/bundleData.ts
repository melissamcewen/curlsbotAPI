import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Reference, AnalysisResult, Extensions } from '../src/types';
import { Analyzer } from '../src/analyzer';
import { frizzbot } from '../src/extensions/frizzbot';
import { porosity } from '../src/extensions/porosity';
import { sebderm } from '../src/extensions/sebdermbot';
import { autoTagger } from '../src/extensions/autoTagger';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');
const CONFIG_DIR = join(__dirname, '../data/config');
const LOGS_DIR = join(__dirname, '../logs');
const INGREDIENTS_OUTPUT_FILE = join(__dirname, '../src/data/bundledData.ts');
const PRODUCTS_OUTPUT_FILE = join(__dirname, '../src/data/bundledProducts.ts');
const UNKNOWN_INGREDIENTS_LOG = join(LOGS_DIR, 'unknown_ingredients.json');
const FLAGGED_PRODUCTS_LOG = join(LOGS_DIR, 'flagged_products.json');
const SEBDERM_SAFE_PRODUCTS_LOG = join(LOGS_DIR, 'sebderm_safe_products.json');
const AUTO_TAGGED_PRODUCTS_LOG = join(LOGS_DIR, 'auto_tagged_products.json');

// Load references data from references.references.json
function loadReferences(): Record<string, Reference> {
  const referencesPath = join(DATA_DIR, 'references.references.json');
  try {
    const data = JSON.parse(readFileSync(referencesPath, 'utf-8'));
    return Object.entries(data.references).reduce(
      (acc: Record<string, Reference>, [id, ref]: [string, any]) => {
        acc[id] = {
          url: ref.url,
          ...(ref.title && { title: ref.title }),
          ...(ref.description && { description: ref.description }),
          ...(ref.type && { type: ref.type }),
          ...(ref.status && { status: ref.status }),
          ...(ref.author && { author: ref.author }),
          ...(ref.date && { date: ref.date }),
          ...(ref.source && { source: ref.source }),
        };
        return acc;
      },
      {},
    );
  } catch (error) {
    console.error('Error loading references:', error);
    process.exit(1);
  }
}

// Convert reference IDs to full reference objects
function populateReferences(
  refs: any[],
  referencesData: Record<string, Reference>,
): Reference[] {
  return refs.map((ref) => {
    const referenceId = ref.id;
    const baseReference = referencesData[referenceId];
    if (!baseReference) {
      console.warn(
        `Warning: Reference ID "${referenceId}" not found in references.json`,
      );
      return { url: 'unknown' };
    }

    // Merge the base reference with any overrides from the ingredient's reference
    return {
      ...baseReference,
      ...(ref.notes && { description: ref.notes }),
      ...(ref.status && { status: ref.status }),
    };
  });
}

function convertToReferenceObjects(refs: (string | Reference)[]): Reference[] {
  return refs.map((ref) => {
    if (typeof ref === 'string') {
      return { url: ref };
    }
    return ref;
  });
}

function generateIdFromName(name: string): string {
  const baseId = name.toLowerCase().replace(/\s+/g, '_');
  return baseId;
}

function loadIngredientsFromDir(dirPath: string): any {
  const files = readdirSync(dirPath).filter((file) =>
    file.endsWith('.ingredients.json'),
  );
  const allIngredients: any[] = [];
  const analyzer = new Analyzer();

  // First load categories to look up groups
  const categoriesData = loadJsonFile(join(DATA_DIR, 'categories.json'));
  const categoryGroups = (categoriesData?.categories || []).reduce(
    (acc: Record<string, string>, cat: any) => {
      if (cat.id && cat.group) {
        acc[cat.id] = cat.group;
      }
      return acc;
    },
    {},
  );

  // Load references data
  const referencesData = loadReferences();

  for (const file of files) {
    const filePath = join(dirPath, file);
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      if (Array.isArray(data.ingredients)) {
        allIngredients.push(...data.ingredients);
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

  return allIngredients.reduce((acc, ingredient) => {
    // Analyze ingredient name to get status
    const analysis = analyzer.analyze(ingredient.name);
    const status = analysis.status === 'error' ? 'warning' : analysis.status;

    // Look up group from categories
    let group: string | undefined;
    if (ingredient.categories && ingredient.categories.length > 0) {
      // Find first category that has a group
      for (const category of ingredient.categories) {
        if (categoryGroups[category]) {
          group = categoryGroups[category];
          break;
        }
      }
    }

    // Populate references if they exist
    const references = ingredient.references
      ? populateReferences(ingredient.references, referencesData)
      : undefined;

    acc[ingredient.id] = {
      ...ingredient,
      status,
      group,
      references,
    };
    return acc;
  }, {});
}

// Function to log unknown ingredients with their source products
function logUnknownIngredients(
  productName: string,
  analysis: AnalysisResult,
  unknownIngredients: Record<string, Set<string>>,
) {
  for (const ingredient of analysis.ingredients) {
    if (!ingredient.ingredient || ingredient.normalized.includes('unknown')) {
      if (!unknownIngredients[ingredient.normalized]) {
        unknownIngredients[ingredient.normalized] = new Set();
      }
      unknownIngredients[ingredient.normalized].add(productName);
    }
  }
}

// Function to track products with non-ok status
interface FlaggedProduct {
  name: string;
  status: 'caution' | 'warning' | 'error';
  reasons: string[];
  ingredients_raw?: string;
  tags: string[];
  flagged_ingredients: Array<{
    name: string;
    status: 'caution' | 'warning';
    reasons: string[];
  }>;
}

function logFlaggedProduct(
  product: { name: string; ingredients_raw?: string; tags?: string[] },
  analysis: AnalysisResult,
  flaggedProducts: FlaggedProduct[],
) {
  if (analysis.status !== 'ok') {
    // Get all ingredients that have caution or warning status
    const flaggedIngredients = analysis.ingredients
      .filter((ing) => ing.status === 'caution' || ing.status === 'warning')
      .map((ing) => ({
        name: ing.name,
        status: ing.status as 'caution' | 'warning',
        reasons: ing.reasons.map((r) => `${r.name}: ${r.reason}`),
      }));

    flaggedProducts.push({
      name: product.name,
      status: analysis.status,
      reasons: analysis.reasons.map((r) => `${r.name}: ${r.reason}`),
      ingredients_raw: product.ingredients_raw,
      tags: product.tags || [],
      flagged_ingredients: flaggedIngredients,
    });
  }
}

// Function to log auto-tagged products
interface AutoTaggedProduct {
  name: string;
  brand: string;
  ingredients_raw?: string;
  auto_tags: string[];
  manual_tags: string[];
}

function logAutoTaggedProduct(
  product: {
    name: string;
    brand: string;
    ingredients_raw?: string;
    tags?: string[];
  },
  autoTags: string[],
  autoTaggedProducts: AutoTaggedProduct[],
) {
  if (autoTags.length > 0) {
    autoTaggedProducts.push({
      name: product.name,
      brand: product.brand,
      ingredients_raw: product.ingredients_raw,
      auto_tags: autoTags,
      manual_tags: product.tags || [],
    });
  }
}

function loadProductsFromDir(dirPath: string): any {
  const files = readdirSync(dirPath).filter((file) =>
    file.endsWith('.products.json'),
  );
  const allProducts: any[] = [];
  const analyzer = new Analyzer();
  const unknownIngredients: Record<string, Set<string>> = {};
  const flaggedProducts: FlaggedProduct[] = [];
  const sebdermSafeProducts: Array<{
    name: string;
    brand: string;
    ingredients_raw?: string;
    buy_links: any[];
    cost?: number;
    cost_rating?: string;
  }> = [];
  const autoTaggedProducts: AutoTaggedProduct[] = [];

  // First load categories to look up groups
  const categoriesData = loadJsonFile(join(DATA_DIR, 'categories.json'));
  const categoryGroups = (categoriesData?.categories || []).reduce(
    (acc: Record<string, string>, cat: { id?: string; group?: string }) => {
      if (cat.id && cat.group) {
        acc[cat.id] = cat.group;
      }
      return acc;
    },
    {},
  );

  // Load references data
  const referencesData = loadReferences();

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

  const products = allProducts.reduce((acc, product) => {
    // Generate ID from name if name exists, otherwise use existing ID or warn
    const productName = product.name || product.id;
    if (!productName) {
      console.warn(
        `Warning: Product missing both 'name' and 'id' fields:`,
        product,
      );
      return acc;
    }

    const productId = generateIdFromName(productName);

    // Analyze ingredients if raw ingredients exist
    let status: 'ok' | 'caution' | 'warning' | 'error' | undefined = undefined;
    let analysis: AnalysisResult | undefined = undefined;
    let extensions: Extensions | undefined = undefined;

    if (product.ingredients_raw) {
      analysis = analyzer.analyze(product.ingredients_raw);
      status = analysis.status;

      // Log unknown ingredients
      logUnknownIngredients(product.name, analysis, unknownIngredients);

      // Log products with non-ok status
      logFlaggedProduct(product, analysis, flaggedProducts);

      // Generate extensions
      const autoTags = autoTagger(analysis).tags;
      extensions = {
        frizzbot: frizzbot(analysis),
        porosity: porosity(analysis),
        sebderm: sebderm(analysis),
        autoTagger: { tags: autoTags },
      };

      // Log auto-tagged products
      logAutoTaggedProduct(product, autoTags, autoTaggedProducts);

      // Merge auto-tags with existing tags
      const allTags = [...new Set([...(product.tags || []), ...autoTags])];
      product.tags = allTags;
    }

    // Convert cost to cost_rating
    let cost_rating: string | undefined = undefined;
    if (product.cost) {
      if (product.cost <= 1) cost_rating = '1';
      else if (product.cost <= 1.5) cost_rating = '2';
      else if (product.cost <= 2) cost_rating = '3';
      else if (product.cost <= 2.5) cost_rating = '4';
      else cost_rating = '5';
    }

    // Check if product is sebderm-safe
    if (extensions?.sebderm && !extensions.sebderm.hasTriggers) {
      sebdermSafeProducts.push({
        name: product.name,
        brand: product.brand,
        ingredients_raw: product.ingredients_raw,
        buy_links: product.buy_links || [],
        cost: product.cost,
        cost_rating: cost_rating,
      });
    }

    acc[productId] = {
      ...product,
      id: productId,
      name: productName,
      product_categories: product.product_categories || [],
      systems_excluded: product.systems_excluded || [],
      tags: product.tags || [],
      status,
      extensions,
      cost: product.cost,
      cost_rating,
    };
    return acc;
  }, {} as Record<string, any>);

  return {
    products,
    unknownIngredients,
    flaggedProducts,
    sebdermSafeProducts,
    autoTaggedProducts,
  };
}

function loadJsonFile(filePath: string): any {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function generateBundledData() {
  // Ensure logs directory exists
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }

  // Load all data
  const ingredients = loadIngredientsFromDir(join(DATA_DIR, 'ingredients'));
  const {
    products,
    unknownIngredients,
    flaggedProducts,
    sebdermSafeProducts,
    autoTaggedProducts,
  } = loadProductsFromDir(join(DATA_DIR, 'products'));
  const categoriesData = loadJsonFile(join(DATA_DIR, 'categories.json'));
  const groupsData = loadJsonFile(join(DATA_DIR, 'groups.json'));
  const systemsData = loadJsonFile(join(CONFIG_DIR, 'systems.json'));
  const settingsData = loadJsonFile(join(CONFIG_DIR, 'settings.json'));
  const referencesData = loadReferences();

  // Write unknown ingredients log if any were found
  if (Object.keys(unknownIngredients).length > 0) {
    // Convert to array, sort by number of products, then convert back to object
    const sortedEntries = Object.entries(unknownIngredients)
      .map(([ingredient, products]) => ({
        ingredient,
        products: Array.from(products as Set<string>),
      }))
      .sort((a, b) => b.products.length - a.products.length)
      .reduce((acc, { ingredient, products }) => {
        acc[ingredient] = products;
        return acc;
      }, {} as Record<string, string[]>);

    writeFileSync(
      UNKNOWN_INGREDIENTS_LOG,
      JSON.stringify(sortedEntries, null, 2),
    );
    console.log(
      `Generated unknown ingredients log at ${UNKNOWN_INGREDIENTS_LOG}`,
    );
  }

  // Write flagged products log if any were found
  if (flaggedProducts.length > 0) {
    writeFileSync(
      FLAGGED_PRODUCTS_LOG,
      JSON.stringify(flaggedProducts, null, 2),
    );
    console.log(`Generated flagged products log at ${FLAGGED_PRODUCTS_LOG}`);
  }

  // Write sebderm-safe products log
  if (sebdermSafeProducts.length > 0) {
    // Sort by brand then name
    const sortedProducts = sebdermSafeProducts.sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.name.localeCompare(b.name);
    });

    writeFileSync(
      SEBDERM_SAFE_PRODUCTS_LOG,
      JSON.stringify(sortedProducts, null, 2),
    );
    console.log(
      `Generated sebderm-safe products log at ${SEBDERM_SAFE_PRODUCTS_LOG}`,
    );
  }

  // Write auto-tagged products log
  if (autoTaggedProducts.length > 0) {
    // Sort by brand then name
    const sortedProducts = autoTaggedProducts.sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.name.localeCompare(b.name);
    });

    writeFileSync(
      AUTO_TAGGED_PRODUCTS_LOG,
      JSON.stringify(sortedProducts, null, 2),
    );
    console.log(
      `Generated auto-tagged products log at ${AUTO_TAGGED_PRODUCTS_LOG}`,
    );
  }

  // Convert categories and groups to record format
  const categories = (categoriesData?.categories || []).reduce(
    (acc: any, cat: any) => {
      if (!cat.id) {
        console.warn(`Warning: Category missing required 'id' field:`, cat);
        return acc;
      }

      // Convert references to notes if they exist
      const notes = cat.references
        ? populateReferences(cat.references, referencesData)
        : undefined;

      acc[cat.id] = {
        ...cat, // Keep all original fields
        // Ensure required fields have defaults if missing
        name: cat.name || cat.id,
        description: cat.description || '',
        group: cat.group || 'others',
        ...(notes && { notes }),
      };
      // Remove old references field if it exists
      delete acc[cat.id].references;
      return acc;
    },
    {},
  );

  const groups = (groupsData?.groups || []).reduce((acc: any, group: any) => {
    if (!group.id) {
      console.warn(`Warning: Group missing required 'id' field:`, group);
      return acc;
    }

    // Convert references to notes if they exist
    const notes = group.references
      ? populateReferences(group.references, referencesData)
      : undefined;

    acc[group.id] = {
      ...group, // Keep all original fields
      // Ensure required fields have defaults if missing
      name: group.name || group.id,
      inclusions: group.inclusions || [],
      defaultIngredient: group.defaultIngredient || undefined,
      ...(notes && { notes }),
    };
    // Remove old references field if it exists
    delete acc[group.id].references;
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
