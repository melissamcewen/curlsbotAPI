import fs from 'fs';
import path from 'path';
import { csv2json } from 'json-2-csv';

interface Ingredient {
  name: string;
  id: string;
  categories: string[];
  synonyms?: string[];
  references?: string[];
  sourceFile: string;
}

interface IngredientsFile {
  ingredients: Ingredient[];
}

async function main() {
  // Read the CSV file
  const csvPath = path.join(process.cwd(), 'data', 'ingredients.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records = await csv2json<Ingredient>(csvContent);

  // Group ingredients by source file
  const groupedIngredients: { [key: string]: Ingredient[] } = {};

  records.forEach(record => {
    const ingredient: Ingredient = {
      name: record.name,
      id: record.id,
      categories: record.categories.split('|'),
      sourceFile: record.sourceFile
    };

    // Only add non-empty arrays
    if (record.synonyms) {
      ingredient.synonyms = record.synonyms.split('|').filter(Boolean);
    }
    if (record.references) {
      ingredient.references = record.references.split('|').filter(Boolean);
    }

    if (!groupedIngredients[record.sourceFile]) {
      groupedIngredients[record.sourceFile] = [];
    }
    groupedIngredients[record.sourceFile].push(ingredient);
  });

  // Write back to JSON files
  Object.entries(groupedIngredients).forEach(([sourceFile, ingredients]) => {
    const filePath = path.join(process.cwd(), 'data', 'ingredients', `${sourceFile}.ingredients.json`);
    const data: IngredientsFile = { ingredients };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Wrote ${ingredients.length} ingredients to ${filePath}`);
  });
}

main().catch(console.error);
