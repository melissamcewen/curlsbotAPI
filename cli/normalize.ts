import { Command } from 'commander';
import { normalizer } from '../src/utils/normalizer';

const program = new Command();

program
  .name('normalize')
  .description('Normalize an ingredient list')
  .argument('<ingredients>', 'Ingredient list to normalize (use quotes for multiple ingredients)')
  .option('-r, --raw', 'Output raw normalized array instead of comma-separated list')
  .action((ingredients, options) => {
    const result = normalizer(ingredients);

    if (!result.isValid) {
      console.error('Invalid ingredient list. Make sure it does not contain URLs and is not empty.');
      process.exit(1);
    }

    if (options.raw) {
      // Output as JSON array
      console.log(JSON.stringify(result.ingredients, null, 2));
    } else {
      // Output as comma-separated list
      console.log(result.ingredients.join(', '));
    }
  });

program.parse();
