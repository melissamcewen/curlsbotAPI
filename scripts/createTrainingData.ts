import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Analyzer } from '../src/analyzer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_CSV = path.join(__dirname, 'products.csv');
const OUTPUT_CSV = path.join(__dirname, '../logs/trainingdata.csv');
const UNKNOWNS_CSV = path.join(__dirname, '../logs/unknowns.csv');
const UNKNOWN_PROTEINS_CSV = path.join(
  __dirname,
  '../logs/unknown_proteins.csv',
);
const UNKNOWN_OILS_CSV = path.join(__dirname, '../logs/unknown_oils.csv');
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
  trim: true, // Trim whitespace from fields
  relaxColumnCount: true, // Allow for inconsistent column counts
});

// Define the structure for the output records
interface OutputRecord {
  name: string;
  ingredients: string;
  label_low: number;
  score_low: number;
}

// Track unknown ingredients and their occurrences
interface UnknownIngredient {
  name: string;
  normalized: string;
  occurrences: number;
  products: string[];
}

// Track ingredients identified as "unknown_protein" or "unknown_oil"
interface TrackedIngredient {
  name: string;
  normalized: string;
  occurrences: number;
  products: string[];
}

// Map to track unknown ingredients by their normalized name
const unknownIngredients = new Map<string, UnknownIngredient>();

// Map to track ingredients identified as "unknown_protein"
const unknownProteins = new Map<string, TrackedIngredient>();

// Map to track ingredients identified as "unknown_oil"
const unknownOils = new Map<string, TrackedIngredient>();

// Process each record
const outputRecords: OutputRecord[] = [];

for (const record of records) {
  const name = record.name;
  const ingredients = record.ingredients;
  const label_low = parseInt(record.label_low || '0', 10); // Convert to number, default to 0
  const score_low = parseInt(record.score_low || '0', 10); // Convert to number, default to 0

  // Analyze the ingredients
  const analysis = analyzer.analyze(ingredients);

  // Extract ingredient IDs from analysis and track unknown ingredients
  const ingredientIds = analysis.ingredients.map((ingredient) => {
    // Check if this is an unknown_protein
    if (ingredient.ingredient?.id === 'unknown_protein') {
      const originalName = ingredient.name;
      const normalizedName = ingredient.normalized;

      if (!unknownProteins.has(normalizedName)) {
        unknownProteins.set(normalizedName, {
          name: originalName,
          normalized: normalizedName,
          occurrences: 0,
          products: [],
        });
      }

      const proteinIngredient = unknownProteins.get(normalizedName)!;
      proteinIngredient.occurrences += 1;

      // Avoid duplicate product names
      if (!proteinIngredient.products.includes(name)) {
        proteinIngredient.products.push(name);
      }

      return 'unknown_protein';
    }
    // Check if this is an unknown_oil
    else if (ingredient.ingredient?.id === 'unknown_oil') {
      const originalName = ingredient.name;
      const normalizedName = ingredient.normalized;

      if (!unknownOils.has(normalizedName)) {
        unknownOils.set(normalizedName, {
          name: originalName,
          normalized: normalizedName,
          occurrences: 0,
          products: [],
        });
      }

      const oilIngredient = unknownOils.get(normalizedName)!;
      oilIngredient.occurrences += 1;

      // Avoid duplicate product names
      if (!oilIngredient.products.includes(name)) {
        oilIngredient.products.push(name);
      }

      return 'unknown_oil';
    }
    // Check if it's an unknown ingredient
    else if (!ingredient.ingredient) {
      // This is an unknown ingredient, track it
      const normalizedName = ingredient.normalized;

      if (!unknownIngredients.has(normalizedName)) {
        unknownIngredients.set(normalizedName, {
          name: ingredient.name,
          normalized: normalizedName,
          occurrences: 0,
          products: [],
        });
      }

      const unknownIngredient = unknownIngredients.get(normalizedName)!;
      unknownIngredient.occurrences += 1;

      // Avoid duplicate product names
      if (!unknownIngredient.products.includes(name)) {
        unknownIngredient.products.push(name);
      }

      return 'unknown';
    }
    return ingredient.ingredient.id;
  });

  // Add to output records
  outputRecords.push({
    name,
    ingredients: ingredientIds.join(','),
    label_low,
    score_low,
  });
}

// Write to main CSV file
const outputCsv = stringify(outputRecords, {
  header: true,
  columns: ['name', 'ingredients', 'label_low', 'score_low'],
});

fs.writeFileSync(OUTPUT_CSV, outputCsv);

// Convert unknown ingredients map to array and sort by occurrences (most frequent first)
const sortedUnknowns = Array.from(unknownIngredients.values()).sort(
  (a, b) => b.occurrences - a.occurrences,
);

// Create records for unknown ingredients CSV
const unknownRecords = sortedUnknowns.map((unknown) => ({
  name: unknown.name,
  normalized: unknown.normalized,
  occurrences: unknown.occurrences,
  products: unknown.products.join('; '),
}));

// Write unknown ingredients to CSV
const unknownsCsv = stringify(unknownRecords, {
  header: true,
  columns: ['name', 'normalized', 'occurrences', 'products'],
});

fs.writeFileSync(UNKNOWNS_CSV, unknownsCsv);

// Sort unknown proteins by occurrences
const sortedUnknownProteins = Array.from(unknownProteins.values()).sort(
  (a, b) => b.occurrences - a.occurrences,
);

// Create records for unknown proteins CSV
const unknownProteinRecords = sortedUnknownProteins.map((protein) => ({
  name: protein.name,
  normalized: protein.normalized,
  occurrences: protein.occurrences,
  products: protein.products.join('; '),
}));

// Write unknown proteins to CSV
const unknownProteinsCsv = stringify(unknownProteinRecords, {
  header: true,
  columns: ['name', 'normalized', 'occurrences', 'products'],
});

fs.writeFileSync(UNKNOWN_PROTEINS_CSV, unknownProteinsCsv);

// Sort unknown oils by occurrences
const sortedUnknownOils = Array.from(unknownOils.values()).sort(
  (a, b) => b.occurrences - a.occurrences,
);

// Create records for unknown oils CSV
const unknownOilRecords = sortedUnknownOils.map((oil) => ({
  name: oil.name,
  normalized: oil.normalized,
  occurrences: oil.occurrences,
  products: oil.products.join('; '),
}));

// Write unknown oils to CSV
const unknownOilsCsv = stringify(unknownOilRecords, {
  header: true,
  columns: ['name', 'normalized', 'occurrences', 'products'],
});

fs.writeFileSync(UNKNOWN_OILS_CSV, unknownOilsCsv);

console.log(`Processed ${records.length} records`);
console.log(`Output written to ${OUTPUT_CSV}`);
console.log(
  `Found ${unknownIngredients.size} unknown ingredients, written to ${UNKNOWNS_CSV}`,
);
console.log(
  `Found ${unknownProteins.size} ingredients identified as "unknown_protein", written to ${UNKNOWN_PROTEINS_CSV}`,
);
console.log(
  `Found ${unknownOils.size} ingredients identified as "unknown_oil", written to ${UNKNOWN_OILS_CSV}`,
);
