import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { IngredientDatabase, Ingredient, Category, Categories, Groups, Ingredients } from '../types';

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
  const ingredientsData = loadAndValidateJson<{ingredients: Ingredient[]}>(
    join(dataDir, 'ingredients.json'),
    ingredientsSchema
  );

  const categoriesData = loadAndValidateJson<{categories: Category[]}>(
    join(dataDir, 'categories.json'),
    categoriesSchema
  );

  const groupsData = loadAndValidateJson<{groups: Groups}>(
    join(dataDir, 'groups.json'),
    groupsSchema
  );

  return {
    ingredients: ingredientsToRecord(ingredientsData.ingredients),
    categories: categoriesToRecord(categoriesData.categories),
    groups: groupsData.groups
  };
};

// Helper function to load individual data types
export const loadIngredients = ({ dataDir, schemaDir }: LoadDatabaseOptions): Ingredients => {
  const schema = loadSchema(join(schemaDir, 'ingredients.schema.json'));
  const data = loadAndValidateJson<{ingredients: Ingredient[]}>(
    join(dataDir, 'ingredients.json'),
    schema
  );
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
  const data = loadAndValidateJson<{groups: Groups}>(
    join(dataDir, 'groups.json'),
    schema
  );
  return data.groups;
};
