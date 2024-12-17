import { join } from 'path';
import { readdirSync } from 'fs';
import { Command } from 'commander';

import { loadDatabase } from '../utils/dataLoader';
import { cleanRedundantSynonyms } from '../validators/duplicates';
import { fixIngredientCase } from '../validators/case';
import { fixIdsInFiles } from '../validators/ids';

export function setupFixCommands(program: Command): void {
  program
    .command('clean-synonyms')
    .description('Remove redundant synonyms that match ingredient names')
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .action((options) => {
      try {
        const dataDir = options.data;
        const ingredientsDir = join(dataDir, 'ingredients');

        console.log(`Cleaning redundant synonyms in ${ingredientsDir}`);

        // Process each ingredients file
        const files = readdirSync(ingredientsDir).filter((file) =>
          file.endsWith('.ingredients.json'),
        );

        let totalChanges = 0;

        files.forEach((file) => {
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
    .command('fix-case')
    .description('Fix case formatting of ingredient names and synonyms')
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .action((options) => {
      try {
        const dataDir = options.data;
        const ingredientsDir = join(dataDir, 'ingredients');

        console.log(`Fixing case formatting in ${ingredientsDir}`);

        const files = readdirSync(ingredientsDir).filter((file) =>
          file.endsWith('.ingredients.json'),
        );

        let totalChanges = 0;

        files.forEach((file) => {
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
    .command('fix-ids')
    .description('Replace hyphens with underscores in all IDs')
    .option(
      '-d, --data <path>',
      'path to data directory',
      join(__dirname, '../../data'),
    )
    .action((options) => {
      try {
        const dataDir = options.data;
        console.log(`Fixing IDs in ${dataDir}`);
        fixIdsInFiles(dataDir);
        console.log('✅ Successfully updated all files with underscore IDs');
      } catch (error) {
        console.error('❌ ID fixing failed:', error.message);
        process.exit(1);
      }
    });
}
