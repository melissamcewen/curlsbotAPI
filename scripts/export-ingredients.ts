import fs from 'fs';
import path from 'path';
import { json2csv } from 'json-2-csv';

interface Ingredient {
  name: string;
  id: string;
  categories: string[];
  synonyms?: string[];
  references?: string[];
}

interface IngredientsFile {
  ingredients: Ingredient[];
}

async function main() {
  // Read all ingredients from JSON files
  const ingredientsDir = path.join(process.cwd(), 'data', 'ingredients');
  const files = fs.readdirSync(ingredientsDir).filter(file => file.endsWith('.ingredients.json'));

  const allIngredients: Ingredient[] = [];

  files.forEach(file => {
    const filePath = path.join(ingredientsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: IngredientsFile = JSON.parse(fileContent);

    // Add source file information to each ingredient
    const sourceFile = file.replace('.ingredients.json', '');
    data.ingredients.forEach(ingredient => {
      allIngredients.push({
        ...ingredient,
        // Convert arrays to strings for CSV
        categories: ingredient.categories.join('|'),
        synonyms: ingredient.synonyms?.join('|') || '',
        references: ingredient.references?.join('|') || '',
        sourceFile // Add source file to track where ingredient came from
      });
    });
  });

  // Convert to CSV
  const csv = await json2csv(allIngredients);

  // Write to file
  const outputPath = path.join(process.cwd(), 'data', 'ingredients.csv');
  fs.writeFileSync(outputPath, csv);

  console.log(`Exported ${allIngredients.length} ingredients to ${outputPath}`);
}

main().catch(console.error);
