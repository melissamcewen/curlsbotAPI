#!/usr/bin/env node

import { Command } from 'commander';
import { Analyzer } from '../src/analyzer';
import { defaultDatabase, defaultSystems, defaultSettings } from '../src/data/bundledData';
import type { IngredientMatch } from '../src/types';

const program = new Command();

const printMatch = (match: IngredientMatch) => {
  console.log(match)
  console.log('\nMatch Details:');
  console.log('Input:', match.input);
  console.log('Normalized:', match.normalized);

  if (match.ingredient) {
    console.log('\nIngredient Info:');
    console.log('- Name:', match.ingredient.name);
    console.log('- ID:', match.ingredient.id);
    if (match.ingredient.description) {
      console.log('- Description:', match.ingredient.description);
    }
    if (match.ingredient.synonyms?.length) {
      console.log('- Synonyms:', match.ingredient.synonyms.join(', '));
    }
  }

  if (match.categories?.length) {
    console.log('\nCategories:', match.categories.join(', '));
  }

  if (match.groups?.length) {
    console.log('Groups:', match.groups.join(', '));
  }

  if (match.flags?.length) {
    console.log('\nFlags:');
    match.flags.forEach(flag => {
      console.log(`- Type: ${flag.type}, Flag: ${flag.flag_type}, ID: ${flag.id}`);
    });
  }

  if (match.match_type) {
    console.log('\nMatch Type:', match.match_type);
  }
};

program
  .name('match')
  .description('Test ingredient matching functionality')
  .argument('<ingredient>', 'ingredient name to match')
  .option('-s, --system <system>', 'system to use for analysis (e.g. curly_default)', 'curly_default')
  .action((ingredient: string, options) => {
    console.log('Testing ingredient match for:', ingredient);

    // Find the requested system
    const system = defaultSystems.find(s => s.id === options.system);
    if (!system) {
      console.error(`System "${options.system}" not found`);
      process.exit(1);
    }

    // Create analyzer with the selected system
    const analyzer = new Analyzer({
      database: defaultDatabase,
      system: system,
      settings: defaultSettings
    });

    // Analyze the ingredient
    const result = analyzer.analyze(ingredient);

    if (result.status === 'error') {
      console.error('Error analyzing ingredient');
      process.exit(1);
    }

    if (result.matches.length === 0) {
      console.log('\nNo matches found');
      process.exit(0);
    }

    // Print system info
    console.log('\nSystem:', system.name);
    console.log('Settings:', result.settings.join(', '));

    // Print matches
    result.matches.forEach((match, index) => {
      if (result.matches.length > 1) {
        console.log(`\n--- Match ${index + 1} of ${result.matches.length} ---`);
      }
      printMatch(match);
    });
  });

program.parse();
