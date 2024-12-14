import { join } from 'path';

import { IngredientDatabase } from '../types';
import { loadDatabase } from '../utils/dataLoader';

// Get the paths relative to this file
const DATA_DIR = __dirname;
const FALLBACK_DIR = join(__dirname, 'fallback');
const SCHEMA_DIR = join(__dirname, 'schema');

let defaultDatabase: IngredientDatabase | null = null;
let fallbackDatabase: IngredientDatabase | null = null;

/**
 * Gets the default database using the built-in data files.
 * Caches the result for subsequent calls.
 */
export const getDefaultDatabase = (): IngredientDatabase => {
  if (!defaultDatabase) {
    try {
      defaultDatabase = loadDatabase({
        dataDir: DATA_DIR,
        schemaDir: SCHEMA_DIR
      });
    } catch (error) {
      // If default database can't be loaded, return an empty database
      defaultDatabase = {
        ingredients: {},
        categories: {},
        groups: {}
      };
    }
  }
  return defaultDatabase;
};

/**
 * Gets the fallback database using the built-in fallback data files.
 * Caches the result for subsequent calls.
 */
export const getFallbackDatabase = (): IngredientDatabase => {
  if (!fallbackDatabase) {
    try {
      // Load only ingredients from fallback
      const fallbackData = loadDatabase({
        dataDir: FALLBACK_DIR,
        schemaDir: SCHEMA_DIR
      });

      // Use the main database's categories and groups
      const mainDb = getDefaultDatabase();

      fallbackDatabase = {
        ingredients: fallbackData.ingredients,
        categories: mainDb.categories,
        groups: mainDb.groups
      };
    } catch (error) {
      // If fallback database can't be loaded, return an empty database
      fallbackDatabase = {
        ingredients: {},
        categories: {},
        groups: {}
      };
    }
  }
  return fallbackDatabase;
};

/**
 * Clears the cached default database.
 * Useful for testing or when you need to reload the data.
 */
export const clearDefaultDatabase = (): void => {
  defaultDatabase = null;
};

/**
 * Clears the cached fallback database.
 * Useful for testing or when you need to reload the data.
 */
export const clearFallbackDatabase = (): void => {
  fallbackDatabase = null;
};
