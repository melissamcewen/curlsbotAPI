import { join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import type { IngredientDatabase, Ingredients } from '../../src/types';

interface LoadDatabaseOptions {
  dataDir: string;
  schemaDir: string;
}

function loadIngredientsFromDir(dirPath: string): Ingredients {
  const files = readdirSync(dirPath).filter(file => file.endsWith('.ingredients.json'));
  console.log(`Found ingredient files: ${files.join(', ')}`);
  const ingredients: Ingredients = {};

  for (const file of files) {
    try {
      const filePath = join(dirPath, file);
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      if (!data.ingredients) {
        console.error(`File ${file} is missing 'ingredients' property`);
        continue;
      }
      // Convert array to record format
      data.ingredients.forEach((ing: any) => {
        ingredients[ing.id] = ing;
      });
    } catch (error) {
      console.error(`Failed to process file ${file}: ${error.message}`);
      throw error;
    }
  }

  return ingredients;
}

export function loadDatabase({ dataDir }: LoadDatabaseOptions): IngredientDatabase {
  try {
    // Read ingredients
    console.log('Reading ingredients...');
    const ingredients = loadIngredientsFromDir(join(dataDir, 'ingredients'));

    // Read categories
    console.log('Reading categories...');
    const categoriesPath = join(dataDir, 'categories.json');
    console.log(`Looking for categories at: ${categoriesPath}`);
    try {
      const categoriesContent = readFileSync(categoriesPath, 'utf-8');
      const categoriesData = JSON.parse(categoriesContent);
      if (!categoriesData.categories) {
        throw new Error('Missing categories property in categories.json');
      }
      const categories = categoriesData.categories.reduce((acc: any, cat: any) => {
        acc[cat.id] = cat;
        return acc;
      }, {});

      // Read groups
      console.log('Reading groups...');
      const groupsPath = join(dataDir, 'groups.json');
      console.log(`Looking for groups at: ${groupsPath}`);
      const groupsContent = readFileSync(groupsPath, 'utf-8');
      const groupsData = JSON.parse(groupsContent);
      if (!groupsData.groups) {
        throw new Error('Missing groups property in groups.json');
      }
      const groups = groupsData.groups.reduce((acc: any, group: any) => {
        acc[group.id] = group;
        return acc;
      }, {});

      return {
        ingredients,
        categories,
        groups
      };
    } catch (error) {
      console.error(`Error reading categories/groups: ${error.message}`);
      throw error;
    }
  } catch (error) {
    throw new Error(`Failed to load database: ${error.message}`);
  }
}
