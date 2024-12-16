#!/usr/bin/env node

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, readdirSync } from 'fs';

import { Command } from 'commander';

import type { IngredientDatabase } from '../src/types';

import { loadDatabase } from './utils/dataLoader';
import { validateSettingsAndSystems } from './utils/validation';


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

function validateDuplicates(database: IngredientDatabase): string[] {
  const errors: string[] = [];
  const ingredients = Object.values(database.ingredients);

  // Track names and synonyms for case-insensitive comparison
  const names = new Map<string, string>(); // lowercase name -> original name
  const synonyms = new Map<string, {name: string, synonym: string}>(); // lowercase synonym -> {ingredient name, original synonym}

  ingredients.forEach(ingredient => {
    // Check for duplicate names
    const lowerName = ingredient.name.toLowerCase();
    if (names.has(lowerName)) {
      errors.push(`❌ Duplicate ingredient name: "${ingredient.name}" matches "${names.get(lowerName)}"`);
    } else {
      names.set(lowerName, ingredient.name);
    }

    // Check for duplicate synonyms
    if (ingredient.synonyms) {
      ingredient.synonyms.forEach(synonym => {
        const lowerSynonym = synonym.toLowerCase();
        if (synonyms.has(lowerSynonym)) {
          const existing = synonyms.get(lowerSynonym);
          if (existing) {
            errors.push(`❌ Duplicate synonym: "${synonym}" used by both "${ingredient.name}" and "${existing.name}"`);
          }
        } else {
          synonyms.set(lowerSynonym, {name: ingredient.name, synonym});
        }

        // Check if synonym matches any ingredient name
        if (names.has(lowerSynonym)) {
          errors.push(`❌ Synonym "${synonym}" of "${ingredient.name}" matches ingredient name "${names.get(lowerSynonym)}"`);
        }
      });
    }
  });

  return errors;
}

function cleanRedundantSynonyms(ingredientsFile: string): boolean {
  const data = JSON.parse(readFileSync(ingredientsFile, 'utf-8'));
  let hasChanges = false;

  data.ingredients = data.ingredients.map((ingredient: { name: string; synonyms?: string[] }) => {
    if (!ingredient.synonyms) return ingredient;

    const nameLower = ingredient.name.toLowerCase();
    const originalLength = ingredient.synonyms.length;

    ingredient.synonyms = ingredient.synonyms.filter(
      (synonym: string) => synonym.toLowerCase() !== nameLower
    );

    if (ingredient.synonyms.length !== originalLength) {
      console.log(`✨ Removed redundant synonym from "${ingredient.name}"`);
      hasChanges = true;
    }

    // Remove the synonyms array if it's empty
    if (ingredient.synonyms.length === 0) {
      delete ingredient.synonyms;
    }

    return ingredient;
  });

  if (hasChanges) {
    writeFileSync(ingredientsFile, JSON.stringify(data, null, 2) + '\n');
  }

  return hasChanges;
}

function isAcronym(word: string): boolean {
  // List of known acronyms that should stay uppercase
  const acronyms = ['PEG', 'PPG', 'SD'];
  return acronyms.includes(word.toUpperCase());
}

function validateNameCase(name: string): boolean {
  // Each word should be capitalized, including after hyphens
  const words = name.split(/[\s-]/);
  return words.every(word => {
    if (!word) return true;
    if (isAcronym(word)) return word === word.toUpperCase();
    return word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase();
  });
}

function validateCaseFormatting(database: IngredientDatabase): string[] {
  const errors: string[] = [];

  Object.values(database.ingredients).forEach(ingredient => {
    // Check ingredient name case
    if (!validateNameCase(ingredient.name)) {
      errors.push(`❌ Invalid name case: "${ingredient.name}" should be like "Cetearyl Alcohol"`);
    }

    // Check synonym case
    if (ingredient.synonyms) {
      ingredient.synonyms.forEach(synonym => {
        if (synonym !== synonym.toLowerCase()) {
          errors.push(`❌ Invalid synonym case: "${synonym}" in "${ingredient.name}" should be lowercase`);
        }
      });
    }
  });

  return errors;
}

function fixIngredientCase(ingredientsFile: string): boolean {
  const data = JSON.parse(readFileSync(ingredientsFile, 'utf-8'));
  let hasChanges = false;

  data.ingredients = data.ingredients.map((ingredient: { name: string; synonyms?: string[] }) => {
    // Fix ingredient name while preserving hyphens and acronyms
    const fixedName = ingredient.name
      .split(/(?<=[-\s])|(?=[-\s])/) // Split but keep delimiters
      .map(part => {
        if (part === '-' || part === ' ') return part;
        if (isAcronym(part)) return part.toUpperCase();
        return part[0].toUpperCase() + part.slice(1).toLowerCase();
      })
      .join('');

    if (fixedName !== ingredient.name) {
      console.log(`✨ Fixed name case: "${ingredient.name}" -> "${fixedName}"`);
      ingredient.name = fixedName;
      hasChanges = true;
    }

    // Fix synonyms
    if (ingredient.synonyms) {
      const originalSynonyms = [...ingredient.synonyms];
      ingredient.synonyms = ingredient.synonyms.map(synonym => synonym.toLowerCase());

      if (JSON.stringify(originalSynonyms) !== JSON.stringify(ingredient.synonyms)) {
        console.log(`✨ Fixed synonym case in "${ingredient.name}"`);
        hasChanges = true;
      }
    }

    return ingredient;
  });

  if (hasChanges) {
    writeFileSync(ingredientsFile, JSON.stringify(data, null, 2) + '\n');
  }

  return hasChanges;
}

program
  .command('validate')
  .description('Validate the database files against their schemas')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../data'))
  .option('-s, --schema <path>', 'path to schema directory', join(__dirname, '../data/schema'))
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
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../data'))
  .option('-s, --schema <path>', 'path to schema directory', join(__dirname, '../data/schema'))
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

program
  .command('validate-duplicates')
  .description('Check for duplicate ingredients, names, and synonyms')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../data'))
  .option('-s, --schema <path>', 'path to schema directory', join(__dirname, '../data/schema'))
  .action((options) => {
    try {
      const dataDir = options.data;
      const schemaDir = options.schema;

      console.log(`Checking for duplicates in ${dataDir}`);
      const database = loadDatabase({ dataDir, schemaDir });

      const errors = validateDuplicates(database);

      if (errors.length > 0) {
        console.error('Found duplicate entries:');
        errors.forEach(error => console.error(error));
        process.exit(1);
      } else {
        console.log('✅ No duplicates found!');
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('clean-synonyms')
  .description('Remove redundant synonyms that match ingredient names')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../data'))
  .action((options) => {
    try {
      const dataDir = options.data;
      const ingredientsDir = join(dataDir, 'ingredients');

      console.log(`Cleaning redundant synonyms in ${ingredientsDir}`);

      // Process each ingredients file
      const files = readdirSync(ingredientsDir)
        .filter(file => file.endsWith('.ingredients.json'));

      let totalChanges = 0;

      files.forEach(file => {
        const filePath = join(ingredientsDir, file);
        if (cleanRedundantSynonyms(filePath)) {
          totalChanges++;
        }
      });

      if (totalChanges > 0) {
        console.log(`✅ Cleaned redundant synonyms in ${totalChanges} files`);
      } else {
        console.log('✅ No redundant synonyms found');
      }
    } catch (error) {
      console.error('❌ Cleaning failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate-case')
  .description('Check ingredient names and synonyms for correct case formatting')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../data'))
  .option('-s, --schema <path>', 'path to schema directory', join(__dirname, '../data/schema'))
  .action((options) => {
    try {
      const dataDir = options.data;
      const schemaDir = options.schema;

      console.log(`Checking case formatting in ${dataDir}`);
      const database = loadDatabase({ dataDir, schemaDir });

      const errors = validateCaseFormatting(database);

      if (errors.length > 0) {
        console.error('Found case formatting issues:');
        errors.forEach(error => console.error(error));
        process.exit(1);
      } else {
        console.log('✅ All names and synonyms are properly cased!');
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('fix-case')
  .description('Fix case formatting of ingredient names and synonyms')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../data'))
  .action((options) => {
    try {
      const dataDir = options.data;
      const ingredientsDir = join(dataDir, 'ingredients');

      console.log(`Fixing case formatting in ${ingredientsDir}`);

      const files = readdirSync(ingredientsDir)
        .filter(file => file.endsWith('.ingredients.json'));

      let totalChanges = 0;

      files.forEach(file => {
        const filePath = join(ingredientsDir, file);
        if (fixIngredientCase(filePath)) {
          totalChanges++;
        }
      });

      if (totalChanges > 0) {
        console.log(`✅ Fixed case formatting in ${totalChanges} files`);
      } else {
        console.log('✅ No case formatting issues found');
      }
    } catch (error) {
      console.error('❌ Case fixing failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate-config')
  .description('Validate settings and systems configuration')
  .option('-d, --data <path>', 'path to data directory', join(__dirname, '../data'))
  .option('-s, --schema <path>', 'path to schema directory', join(__dirname, '../data/schema'))
  .option('-c, --config <path>', 'path to config directory', join(__dirname, '../data'))
  .action((options) => {
    try {
      console.log('Validating settings and systems configuration...');
      const database = loadDatabase({ dataDir: options.data, schemaDir: options.schema });
      const errors = validateSettingsAndSystems(database, options.config);

      if (errors.length > 0) {
        console.error('Found configuration errors:');
        errors.forEach(error => console.error(error));
        process.exit(1);
      } else {
        console.log('✅ Settings and systems configuration is valid!');
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

program.parse();
