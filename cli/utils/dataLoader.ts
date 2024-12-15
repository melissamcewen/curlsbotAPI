import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

import Ajv from 'ajv';
import type { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import type { IngredientDatabase, Ingredient, Category, Categories, Groups, Ingredients } from '../../src/types';

// Initialize Ajv
const ajv = new Ajv();
addFormats(ajv);

// Load and validate schema
const loadSchema = (schemaPath: string) => {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  return ajv.compile(schema);
};

// Load and validate JSON data
const loadAndValidateJson = <T>(filePath: string, validate: ValidateFunction): T => {
  const data = JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  const isValid = validate(data);

  if (!isValid) {
    throw new Error(`Invalid data in ${filePath}: ${JSON.stringify(validate.errors)}`);
  }

  return data;
};

// Load all ingredient files from a directory and merge them
const loadIngredientsFromDir = (dirPath: string, validate: ValidateFunction): {ingredients: Ingredient[]} => {
  const files = readdirSync(dirPath).filter(file => file.endsWith('.ingredients.json'));
  const allIngredients: Ingredient[] = [];

  for (const file of files) {
    const filePath = join(dirPath, file);
    const data = loadAndValidateJson<{ingredients: Ingredient[]}>(filePath, validate);
    allIngredients.push(...data.ingredients);
  }

  return { ingredients: allIngredients };
};

// Convert arrays to records
const ingredientsToRecord = (ingredients: Ingredient[]): Ingredients => {
  const record: Ingredients = {};
  for (const ingredient of ingredients) {
    record[ingredient.id] = ingredient;
  }
  return record;
};

const categoriesToRecord = (categories: Category[]): Categories => {
  const record: Categories = {};
  for (const category of categories) {
    record[category.id] = category;
  }
  return record;
};

const groupsToRecord = (groups: { id: string; name: string }[]): Groups => {
  const record: Groups = {};
  for (const group of groups) {
    record[group.id] = group;
  }
  return record;
};

interface LoadDatabaseOptions {
  dataDir: string;
  schemaDir: string;
}

// Helper function to load individual data types
export const loadIngredients = ({ dataDir, schemaDir }: LoadDatabaseOptions): Ingredients => {
  const schema = loadSchema(join(schemaDir, 'ingredients.schema.json'));
  const data = loadIngredientsFromDir(join(dataDir, 'ingredients'), schema);
  return ingredientsToRecord(data.ingredients);
};

export const loadCategories = ({ dataDir, schemaDir }: LoadDatabaseOptions): Categories => {
  const schema = loadSchema(join(schemaDir, 'categories.schema.json'));
  const categoriesPath = join(dataDir, 'categories.json');
  if (!existsSync(categoriesPath)) {
    return {};
  }
  const data = loadAndValidateJson<{categories: Category[]}>(categoriesPath, schema);
  return categoriesToRecord(data.categories);
};

export const loadGroups = ({ dataDir, schemaDir }: LoadDatabaseOptions): Groups => {
  const schema = loadSchema(join(schemaDir, 'groups.schema.json'));
  const groupsPath = join(dataDir, 'groups.json');
  if (!existsSync(groupsPath)) {
    return {};
  }
  const data = loadAndValidateJson<{groups: { id: string; name: string }[]}>(groupsPath, schema);
  return groupsToRecord(data.groups);
};

/**
 * Loads all data from the specified directory
 */
export const loadDatabase = (options: LoadDatabaseOptions): IngredientDatabase => {
  return {
    ingredients: loadIngredients(options),
    categories: loadCategories(options),
    groups: loadGroups(options)
  };
};
