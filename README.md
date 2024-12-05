# Haircare Ingredients Analyzer

A comprehensive library for analyzing haircare product ingredients, with a focus on curly hair care methods and ingredient safety.

## Features

- ✨ Ingredient parsing and normalization
- 🔍 Exact and fuzzy matching of ingredients
- 🏷️ Synonym matching support
- 📚 Detailed ingredient information
- 🗂️ Category-based ingredient searching
- 💻 Command-line interface with colored output
- 📊 Confidence scoring for fuzzy matches

## Installation

```bash
npm install haircare-ingredients-analyzer
```

## Usage

### Library Usage

```typescript
import { analyzeIngredients, findIngredientsByCategory } from 'haircare-ingredients-analyzer';

// Analyze a list of ingredients
const ingredients = 'Water, Cetyl Alcohol, Isopropyl Alcohol';
const analysis = analyzeIngredients(ingredients);
console.log(analysis);

// Find all ingredients in a specific category
const fattyAlcohols = findIngredientsByCategory('fatty alcohol');
console.log(fattyAlcohols);
```

### Command Line Usage

```bash
# Using npx
npx analyze-ingredients "Water, Cetyl Alcohol, Isopropyl Alcohol"

# Or after global installation
npm install -g haircare-ingredients-analyzer
analyze-ingredients "Water, Cetyl Alcohol, Isopropyl Alcohol"
```

## API Reference

### analyzeIngredients(ingredientString: string): AnalysisResult

Analyzes a comma-separated string of ingredients and returns detailed information about each ingredient.

Example Response:
```typescript
{
  // Array of ingredient matches with detailed information
  matches: [
    {
      name: "Cetyl Alcohol",              // Original ingredient name
      normalized: "cetyl alcohol",        // Normalized for matching
      matched: true,                      // Whether a match was found
      details: {
        name: "Cetyl Alcohol",
        description: "A fatty alcohol that acts as an emollient...",
        category: ["fatty alcohol", "emollient"],
        notes: "Common in conditioners...",
        synonyms: ["hexadecan-1-ol", "1-hexadecanol"]
      },
      categories: ["fatty alcohol", "emollient"],
      fuzzyMatch: false,                  // Whether fuzzy matching was used
      confidence: 1,                      // Confidence score for fuzzy matches
      matchedSynonym: undefined          // Matched synonym if applicable
    },
    {
      name: "Unknown Ingredient",
      normalized: "unknown ingredient",
      matched: false                      // No match found
    }
  ],
  // Array of all unique categories found in matched ingredients
  categories: [
    "fatty alcohol",
    "emollient",
    "drying alcohol"
  ]
}
```

### findIngredientsByCategory(category: string): string[]

Returns an array of ingredient names that belong to the specified category.

Example Response:
```typescript
[
  "Cetyl Alcohol",
  "Cetearyl Alcohol",
  "Stearyl Alcohol"
]
```

## Data Structures

### Ingredient Interface

```typescript
interface Ingredient {
  name: string;          // Display name of the ingredient
  description: string;   // Detailed description
  category: string[];    // Categories this ingredient belongs to
  notes?: string;        // Additional usage notes
  source?: string[];     // Reference sources
  synonyms?: string[];   // Alternative names for the ingredient
}
```

### IngredientMatch Interface

```typescript
interface IngredientMatch {
  name: string;          // Original ingredient name from input
  normalized: string;    // Normalized name for matching
  matched: boolean;      // Whether a match was found
  details?: Ingredient;  // Full ingredient details if matched
  categories?: string[]; // Categories if matched
  fuzzyMatch?: boolean;  // Whether fuzzy matching was used
  confidence?: number;   // Confidence score for fuzzy matches
  matchedSynonym?: string; // Matched synonym if applicable
}
```

### AnalysisResult Interface

```typescript
interface AnalysisResult {
  matches: IngredientMatch[];  // Array of ingredient matches
  categories: string[];        // All unique categories found
}
```

## Project Structure

```
src/
├── cli.ts                 # Command-line interface
├── data/
│   └── ingredients.ts     # Ingredient database
├── types/
│   └── index.ts          # TypeScript interfaces
└── utils/
    ├── analyzer.ts       # Main analysis logic
    ├── matcher.ts        # Ingredient matching
    ├── normalizer.ts     # Name normalization
    └── parser.ts         # Ingredient list parsing
```

### Key Components

- **analyzer.ts**: Main analysis logic that coordinates ingredient parsing and matching
- **matcher.ts**: Handles exact, fuzzy, and synonym matching using Fuse.js
- **normalizer.ts**: Standardizes ingredient names for consistent matching
- **parser.ts**: Splits ingredient lists into individual ingredients
- **ingredients.ts**: Database of ingredients with properties and categories

## Example Output

Command line output includes:
- ✓ Matched ingredients with details
- ✗ Unmatched ingredients
- Fuzzy match confidence scores
- Matched synonyms
- Category information
- Summary statistics

Example:
```bash
$ analyze-ingredients "Cetyl Alcohol, SLES, Unknown Ingredient"

Ingredient Analysis Results:

✓ Cetyl Alcohol
  Categories: fatty alcohol, emollient
  Description: A fatty alcohol that acts as an emollient and emulsifier.
  Notes: Common in conditioners and styling products

✓ SLES
  Matched synonym: sles
  Categories: sulfate, harsh cleanser
  Description: A strong cleansing agent and surfactant.
  Notes: Generally recommended to avoid in curly hair routines

✗ Unknown Ingredient - No match found

Summary:
Total ingredients: 3
Matched ingredients: 2 (67%)
Unmatched ingredients: 1

Categories Found:
- fatty alcohol
- emollient
- sulfate
- harsh cleanser
```

## Best Practices

- Use normalized ingredient names for consistent matching
- Check the `matched` property before accessing details
- Consider fuzzy matches with high confidence scores
- Use synonym matching for common alternative names
- Validate ingredient categories for safety analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Try the CLI
npm run analyze "Your, Ingredients, Here"
```

## License

MIT