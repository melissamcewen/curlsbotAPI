import { join } from 'path';
import { Command } from 'commander';

import { loadDatabase } from '../utils/dataLoader';
import { validateSettingsAndSystems } from '../utils/validation';
import { validateRelationships } from '../validators/relationships';
import { validateDuplicates } from '../validators/duplicates';
import { validateCaseFormatting } from '../validators/case';
import { validateIds } from '../validators/ids';

export function setupValidateCommands(program: Command): void {
  program
    .command('validate')
    .description('Validate the database files against their schemas')
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .option(
      '-s, --schema <path>',
      'path to schema directory',
      join(__dirname, '../../data/schema'),
    )
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
    .description(
      'Validate relationships between ingredients, categories, and groups',
    )
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .option(
      '-s, --schema <path>',
      'path to schema directory',
      join(__dirname, '../../data/schema'),
    )
    .action((options) => {
      try {
        const dataDir = options.data;
        const schemaDir = options.schema;

        console.log(`Validating relationships in ${dataDir}`);
        const database = loadDatabase({ dataDir, schemaDir });

        const relationshipErrors = validateRelationships(database);
        const idErrors = validateIds(database);
        const errors = [...relationshipErrors, ...idErrors];

        if (errors.length > 0) {
          console.error('Found validation errors:');
          errors.forEach((error) => console.error(error));
          process.exit(1);
        } else {
          console.log('✅ All validations passed!');
        }
      } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
      }
    });

  program
    .command('validate-duplicates')
    .description('Check for duplicate ingredients, names, and synonyms')
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .option(
      '-s, --schema <path>',
      'path to schema directory',
      join(__dirname, '../../data/schema'),
    )
    .action((options) => {
      try {
        const dataDir = options.data;
        const schemaDir = options.schema;

        console.log(`Checking for duplicates in ${dataDir}`);
        const database = loadDatabase({ dataDir, schemaDir });

        const errors = validateDuplicates(database);

        if (errors.length > 0) {
          console.error('Found duplicate entries:');
          errors.forEach((error) => console.error(error));
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
    .command('validate-case')
    .description(
      'Check ingredient names and synonyms for correct case formatting',
    )
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .option(
      '-s, --schema <path>',
      'path to schema directory',
      join(__dirname, '../../data/schema'),
    )
    .action((options) => {
      try {
        const dataDir = options.data;
        const schemaDir = options.schema;

        console.log(`Checking case formatting in ${dataDir}`);
        const database = loadDatabase({ dataDir, schemaDir });

        const errors = validateCaseFormatting(database);

        if (errors.length > 0) {
          console.error('Found case formatting issues:');
          errors.forEach((error) => console.error(error));
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
    .command('validate-config')
    .description('Validate settings and systems configuration')
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .option(
      '-s, --schema <path>',
      'path to schema directory',
      join(__dirname, '../../data/schema'),
    )
    .option(
      '-c, --config <path>',
      'path to config directory',
      join(__dirname, '../../data'),
    )
    .action((options) => {
      try {
        console.log('Validating settings and systems configuration...');
        const database = loadDatabase({
          dataDir: options.data,
          schemaDir: options.schema,
        });
        const errors = validateSettingsAndSystems(database, options.config);

        if (errors.length > 0) {
          console.error('Found configuration errors:');
          errors.forEach((error) => console.error(error));
          process.exit(1);
        } else {
          console.log('✅ Settings and systems configuration is valid!');
        }
      } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
      }
    });
}
