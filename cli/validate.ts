#!/usr/bin/env node

import { Command } from 'commander';
import { loadDatabase } from '../src/utils/dataLoader';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { IngredientDatabase } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
  .name('curlsbot-cli')
  .description('CLI tools for CurlsBot API development')
  .version('1.0.0');

function validateRelationships(database: IngredientDatabase): string[] {
  const errors: string[] = [];

  // Check that all ingredient categories exist
  Object.values(database.ingredients).forEach(ingredient => {
    ingredient.categories.forEach(categoryId => {
      if (!database.categories[categoryId]) {
        errors.push(`❌ Invalid category "${categoryId}" referenced by ingredient "${ingredient.name}"`);
      }
    });
  });

  // Check that no ingredients use group IDs as categories
  const groupIds = Object.keys(database.groups);
  Object.values(database.ingredients).forEach(ingredient => {
    ingredient.categories.forEach(categoryId => {
      if (groupIds.includes(categoryId)) {
        errors.push(`❌ Group "${categoryId}" used as category in ingredient "${ingredient.name}"`);
      }
    });
  });

  // Check that all category groups exist
  Object.values(database.categories).forEach(category => {
    if (!database.groups[category.group]) {
      errors.push(`❌ Invalid group "${category.group}" referenced by category "${category.name}"`);
    }
  });

  return errors;
}

program
  .command('validate')
  .description('Validate the database files against their schemas')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../src/data'))
  .option('-s, --schema <path>', 'path to schema directory', join(__dirname, '../src/data/schema'))
  .action((options) => {
    try {
      const dataDir = options.data;
      const schemaDir = options.schema;

      console.log(`Validating database in ${dataDir}`);
      console.log(`Using schemas from ${schemaDir}`);

      // This will throw an error if validation fails
      loadDatabase({ dataDir, schemaDir });

      console.log('✅ Database validation successful!');
    } catch (error) {
      console.error('❌ Database validation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate-relationships')
  .description('Validate relationships between ingredients, categories, and groups')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../src/data'))
  .option('-s, --schema <path>', 'path to schema directory', join(__dirname, '../src/data/schema'))
  .action((options) => {
    try {
      const dataDir = options.data;
      const schemaDir = options.schema;

      console.log(`Validating relationships in ${dataDir}`);
      const database = loadDatabase({ dataDir, schemaDir });

      const errors = validateRelationships(database);

      if (errors.length > 0) {
        console.error('Found relationship errors:');
        errors.forEach(error => console.error(error));
        process.exit(1);
      } else {
        console.log('✅ All relationships are valid!');
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

program.parse();
