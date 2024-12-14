import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import type { IngredientDatabase, Ingredient, Category, Categories, Groups, Ingredients } from '../types';

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
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
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

// Transform array of categories to Record
const categoriesToRecord = (categories: Category[]): Categories => {
  return categories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Categories);
};

// Transform array of ingredients to Record
const ingredientsToRecord = (ingredients: Ingredient[]): Ingredients => {
  return ingredients.reduce((acc, ingredient) => {
    acc[ingredient.id] = ingredient;
    return acc;
  }, {} as Ingredients);
};

// Transform array of groups to Record
const groupsToRecord = (groups: { id: string; name: string }[]): Groups => {
  return groups.reduce((acc, group) => {
    acc[group.id] = group;
    return acc;
  }, {} as Groups);
};

export interface LoadDatabaseOptions {
  /** Directory containing the data files */
  dataDir: string;
  /** Directory containing the schema files */
  schemaDir: string;
}

export const loadDatabase = ({ dataDir, schemaDir }: LoadDatabaseOptions): IngredientDatabase => {
  // Load schemas
  const ingredientsSchema = loadSchema(join(schemaDir, 'ingredients.schema.json'));
  const categoriesSchema = loadSchema(join(schemaDir, 'categories.schema.json'));
  const groupsSchema = loadSchema(join(schemaDir, 'groups.schema.json'));

  // Load and validate data
  const ingredientsData = loadIngredientsFromDir(join(dataDir, 'ingredients'), ingredientsSchema);

  const categoriesData = loadAndValidateJson<{categories: Category[]}>(
    join(dataDir, 'categories.json'),
    categoriesSchema
  );

  const groupsData = loadAndValidateJson<{groups: { id: string; name: string }[]}>(
    join(dataDir, 'groups.json'),
    groupsSchema
  );

  return {
    ingredients: ingredientsToRecord(ingredientsData.ingredients),
    categories: categoriesToRecord(categoriesData.categories),
    groups: groupsToRecord(groupsData.groups)
  };
};

// Helper function to load individual data types
export const loadIngredients = ({ dataDir, schemaDir }: LoadDatabaseOptions): Ingredients => {
  const schema = loadSchema(join(schemaDir, 'ingredients.schema.json'));
  const data = loadIngredientsFromDir(join(dataDir, 'ingredients'), schema);
  return ingredientsToRecord(data.ingredients);
};

export const loadCategories = ({ dataDir, schemaDir }: LoadDatabaseOptions): Categories => {
  const schema = loadSchema(join(schemaDir, 'categories.schema.json'));
  const data = loadAndValidateJson<{categories: Category[]}>(
    join(dataDir, 'categories.json'),
    schema
  );
  return categoriesToRecord(data.categories);
};

export const loadGroups = ({ dataDir, schemaDir }: LoadDatabaseOptions): Groups => {
  const schema = loadSchema(join(schemaDir, 'groups.schema.json'));
  const data = loadAndValidateJson<{groups: { id: string; name: string }[]}>(
    join(dataDir, 'groups.json'),
    schema
  );
  return groupsToRecord(data.groups);
};
