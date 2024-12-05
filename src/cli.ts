#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { analyzeIngredients } from './utils/analyzer';
import { getCategoryInfo, getCategoryGroup } from './utils/categoryInfo';

const program = new Command();

function getImpactColor(impact: 'good' | 'caution' | 'bad'): chalk.Chalk {
  switch (impact) {
    case 'good':
      return chalk.green;
    case 'caution':
      return chalk.yellow;
    case 'bad':
      return chalk.red;
    default:
      return chalk.white;
  }
}

program
  .name('analyze-ingredients')
  .description('Analyze haircare product ingredients')
  .argument('<ingredients>', 'Comma-separated list of ingredients')
  .action((ingredients: string) => {
    const analysis = analyzeIngredients(ingredients);
    
    console.log(chalk.bold('\nIngredient Analysis Results:\n'));
    
    // Ingredient Analysis
    analysis.matches.forEach(result => {
      if (result.matched) {
        console.log(chalk.green('✓'), chalk.bold(result.name));
        
        if (result.fuzzyMatch) {
          console.log(chalk.yellow('  Fuzzy matched with confidence:', Math.round(result.confidence! * 100) + '%'));
        }
        
        if (result.matchedSynonym) {
          console.log(chalk.blue('  Matched synonym:', result.matchedSynonym));
        }
        
        // Display categories with their metadata
        if (result.categories && result.categories.length > 0) {
          console.log(chalk.bold('\n  Categories:'));
          result.categories.forEach(categoryName => {
            const categoryInfo = getCategoryInfo(categoryName);
            const groupName = getCategoryGroup(categoryName);
            
            if (categoryInfo) {
              const impactColor = getImpactColor(categoryInfo.impact);
              console.log(
                '   •',
                chalk.bold(`${categoryInfo.name} `),
                chalk.dim(`(${groupName})`),
                impactColor(`[${categoryInfo.impact}]`)
              );
              console.log('     ', chalk.dim(categoryInfo.description));
              if (categoryInfo.notes) {
                console.log('     ', chalk.italic.dim(categoryInfo.notes));
              }
            } else {
              console.log('   •', categoryName);
            }
          });
        }
        
        console.log('\n  Description:', result.details!.description);
        
        if (result.details!.notes) {
          console.log('  Notes:', chalk.italic(result.details!.notes));
        }
        
        console.log();
      } else {
        console.log(chalk.red('✗'), chalk.bold(result.name), '- No match found\n');
      }
    });

    // Summary Statistics
    const matchedCount = analysis.matches.filter(r => r.matched).length;
    const totalCount = analysis.matches.length;
    const matchPercentage = Math.round((matchedCount / totalCount) * 100);

    console.log(chalk.bold('\nSummary:'));
    console.log(`Total ingredients: ${totalCount}`);
    console.log(`Matched ingredients: ${matchedCount} (${matchPercentage}%)`);
    console.log(`Unmatched ingredients: ${totalCount - matchedCount}`);
    
    // Category Summary
    if (analysis.categories.length > 0) {
      console.log(chalk.bold('\nCategories Found:'));
      
      // Group categories by their group
      const categoriesByGroup = new Map<string, string[]>();
      
      analysis.categories.forEach(categoryName => {
        const groupName = getCategoryGroup(categoryName);
        if (groupName) {
          if (!categoriesByGroup.has(groupName)) {
            categoriesByGroup.set(groupName, []);
          }
          categoriesByGroup.get(groupName)!.push(categoryName);
        }
      });
      
      // Display grouped categories with impact indicators
      categoriesByGroup.forEach((categories, groupName) => {
        console.log(chalk.bold(`\n${groupName}:`));
        categories.forEach(categoryName => {
          const info = getCategoryInfo(categoryName);
          if (info) {
            const impactColor = getImpactColor(info.impact);
            console.log(`  • ${info.name} ${impactColor(`[${info.impact}]`)}`);
          } else {
            console.log(`  • ${categoryName}`);
          }
        });
      });
    }
    
    console.log();
  });

program.parse();