import { join } from 'path';

import type { IngredientDatabase } from '../types';
import { loadDatabase } from '../utils/dataLoader';

// Get the paths relative to this file
const DEFAULT_DATA_DIR = __dirname;
const DEFAULT_FALLBACK_DIR = join(__dirname, 'fallback');
const SCHEMA_DIR = join(__dirname, 'schema');

let defaultDatabase: IngredientDatabase | null = null;
let fallbackDatabase: IngredientDatabase | null = null;

/**
 * Gets the default database using the built-in data files.
 * Caches the result for subsequent calls.
 * @param dataDir Optional directory to load data from (useful for testing)
 */
export const getDefaultDatabase = (dataDir: string = DEFAULT_DATA_DIR): IngredientDatabase => {
  if (!defaultDatabase) {
    try {
      defaultDatabase = loadDatabase({
        dataDir,
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
 * @param fallbackDir Optional directory to load fallback data from (useful for testing)
 * @param mainDataDir Optional directory to load main data from (useful for testing)
 */
export const getFallbackDatabase = (
  fallbackDir: string = DEFAULT_FALLBACK_DIR,
  mainDataDir: string = DEFAULT_DATA_DIR
): IngredientDatabase => {
  if (!fallbackDatabase) {
    try {
      console.log('Loading fallback data from:', fallbackDir);
      // Load only ingredients from fallback
      const fallbackData = loadDatabase({
        dataDir: fallbackDir,
        schemaDir: SCHEMA_DIR
      });
      console.log('Loaded fallback data:', JSON.stringify(fallbackData, null, 2));

      console.log('Loading main data from:', mainDataDir);
      // Use the main database's categories and groups
      const mainDb = getDefaultDatabase(mainDataDir);
      console.log('Loaded main data:', JSON.stringify(mainDb, null, 2));

      fallbackDatabase = {
        ingredients: fallbackData.ingredients,
        categories: mainDb.categories,
        groups: mainDb.groups
      };
      console.log('Combined fallback database:', JSON.stringify(fallbackDatabase, null, 2));
    } catch (error) {
      console.error('Error loading fallback database:', error);
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
