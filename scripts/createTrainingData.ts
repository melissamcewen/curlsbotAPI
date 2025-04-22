import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Analyzer } from '../src/analyzer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_CSV = path.join(__dirname, 'products.csv');
const OUTPUT_CSV = path.join(__dirname, '../logs/trainingdata.csv');
const LOGS_DIR = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Initialize the analyzer
const analyzer = new Analyzer();

// Read and parse the CSV file
const csvData = fs.readFileSync(INPUT_CSV, 'utf-8');
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
});

// Process each record
const outputRecords = [];

for (const record of records) {
  const ingredients = record.ingredients;
  const label_low = parseInt(record.label_low, 10); // Convert to number

  // Analyze the ingredients
  const analysis = analyzer.analyze(ingredients);

  // Extract ingredient IDs from analysis
  const ingredientIds = analysis.ingredients
    .map(ingredient => ingredient.ingredient?.id || "unknown"); // Use "unknown" for missing IDs

  // Add to output records
  outputRecords.push({
    ingredients: ingredientIds.join(','),
    label_low,
  });
}

// Write to CSV file
const outputCsv = stringify(outputRecords, {
  header: true,
  columns: ['ingredients', 'label_low'],
});

fs.writeFileSync(OUTPUT_CSV, outputCsv);

console.log(`Processed ${records.length} records`);
console.log(`Output written to ${OUTPUT_CSV}`);
