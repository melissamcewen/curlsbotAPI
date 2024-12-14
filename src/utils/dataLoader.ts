import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { IngredientDatabase, Ingredient, Categories, Groups } from '../types';

// Initialize Ajv
const ajv = new Ajv();
addFormats(ajv);

// Load and validate schema
const loadSchema = (schemaPath: string) => {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  return ajv.compile(schema);
};

// Load and validate JSON data
const loadAndValidateJson = <T>(filePath: string, validate: any): T => {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const isValid = validate(data);

  if (!isValid) {
    throw new Error(`Invalid data in ${filePath}: ${JSON.stringify(validate.errors)}`);
  }

  return data;
};

export const loadDatabase = (dataDir: string): IngredientDatabase => {
  // Load schemas
  const ingredientsSchema = loadSchema(join(dataDir, 'schema/ingredients.schema.json'));
  const categoriesSchema = loadSchema(join(dataDir, 'schema/categories.schema.json'));
  const groupsSchema = loadSchema(join(dataDir, 'schema/groups.schema.json'));

  // Load and validate data
  const ingredientsData = loadAndValidateJson<{ingredients: Ingredient[]}>(
    join(dataDir, 'ingredients.json'),
    ingredientsSchema
  );

  const categoriesData = loadAndValidateJson<{categories: Categories}>(
    join(dataDir, 'categories.json'),
    categoriesSchema
  );

  const groupsData = loadAndValidateJson<{groups: Groups}>(
    join(dataDir, 'groups.json'),
    groupsSchema
  );

  return {
    ingredients: ingredientsData.ingredients,
    categories: categoriesData.categories,
    groups: groupsData.groups
  };
};

// Helper function to load individual data types
export const loadIngredients = (dataDir: string): Ingredient[] => {
  const schema = loadSchema(join(dataDir, 'schema/ingredients.schema.json'));
  const data = loadAndValidateJson<{ingredients: Ingredient[]}>(
    join(dataDir, 'ingredients.json'),
    schema
  );
  return data.ingredients;
};

export const loadCategories = (dataDir: string): Categories => {
  const schema = loadSchema(join(dataDir, 'schema/categories.schema.json'));
  const data = loadAndValidateJson<{categories: Categories}>(
    join(dataDir, 'categories.json'),
    schema
  );
  return data.categories;
};

export const loadGroups = (dataDir: string): Groups => {
  const schema = loadSchema(join(dataDir, 'schema/groups.schema.json'));
  const data = loadAndValidateJson<{groups: Groups}>(
    join(dataDir, 'groups.json'),
    schema
  );
  return data.groups;
};
