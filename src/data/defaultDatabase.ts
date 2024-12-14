import { join } from 'path';

import { IngredientDatabase } from '../types';
import { loadDatabase } from '../utils/dataLoader';

// Get the paths relative to this file
const DATA_DIR = __dirname;
const SCHEMA_DIR = join(__dirname, 'schema');

let defaultDatabase: IngredientDatabase | null = null;

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
 * Clears the cached default database.
 * Useful for testing or when you need to reload the data.
 */
export const clearDefaultDatabase = (): void => {
  defaultDatabase = null;
};
