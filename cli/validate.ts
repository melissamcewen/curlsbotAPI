#!/usr/bin/env node

import { Command } from 'commander';
import { loadDatabase } from '../src/utils/dataLoader';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
  .name('curlsbot-cli')
  .description('CLI tools for CurlsBot API development')
  .version('1.0.0');

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

program.parse();
