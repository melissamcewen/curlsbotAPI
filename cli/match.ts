#!/usr/bin/env node

import { Command } from 'commander';
import { findIngredient } from '../src/utils/databaseUtils';
import { defaultDatabase } from '../src/data/bundledData';

const program = new Command();

program
  .name('match')
  .description('Test ingredient matching functionality')
  .argument('<ingredient>', 'ingredient name to match')
  .action((ingredient: string) => {
    console.log('Testing ingredient match for:', ingredient);

    const match = findIngredient(defaultDatabase, ingredient);

    if (match) {
      console.log('\nMatch found!');
      console.log('Ingredient:', match.ingredient.name);
      console.log('ID:', match.ingredient.id);
      console.log('Confidence:', match.confidence);
      console.log('Categories:', match.ingredient.categories);
      if (match.ingredient.synonyms) {
        console.log('Synonyms:', match.ingredient.synonyms);
      }
    } else {
      console.log('\nNo match found');
    }
  });

program.parse();
