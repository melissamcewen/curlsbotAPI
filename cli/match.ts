#!/usr/bin/env node

import { Command } from 'commander';
import { Analyzer } from '../src/analyzer';
import { defaultDatabase, defaultSystems, defaultSettings } from '../src/data/bundledData';
import type { IngredientResult } from '../src/types';

const program = new Command();

const printMatch = (match: IngredientResult) => {
  console.log('\nMatch Details:');
  console.log('Input:', match.name);
  console.log('Normalized:', match.normalized);
  console.log('Status:', match.status);

  if (match.reasons.length > 0) {
    console.log('\nReasons:');
    match.reasons.forEach(reason => {
      console.log(`- Setting: ${reason.setting}`);
      console.log(`  Reason: ${reason.reason}`);
    });
  }

  if (match.ingredient) {
    console.log('\nIngredient Info:');
    console.log('- Name:', match.ingredient.name);
    console.log('- ID:', match.ingredient.id);
    if (match.ingredient.description) {
      console.log('- Description:', match.ingredient.description);
    }
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

    // Print system info
    console.log('\nSystem:', system.name);

    // Print overall status and reasons
    console.log('\nOverall Status:', result.status);
    if (result.reasons.length > 0) {
      console.log('\nOverall Reasons:');
      result.reasons.forEach(reason => {
        console.log(`- Setting: ${reason.setting}`);
        console.log(`  Reason: ${reason.reason}`);
      });
    }

    // Print matches
    result.ingredients.forEach((match, index) => {
      if (result.ingredients.length > 1) {
        console.log(`\n--- Match ${index + 1} of ${result.ingredients.length} ---`);
      }
      printMatch(match);
    });
  });

program.parse();
