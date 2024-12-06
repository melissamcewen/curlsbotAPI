# Haircare Ingredients Analyzer

A comprehensive library for analyzing haircare product ingredients, with a focus on curly hair care methods and ingredient safety.

## Features

- ✨ Ingredient parsing and normalization
- 🔍 Exact and fuzzy matching of ingredients
- 🏷️ Synonym matching support
- 📚 Detailed ingredient information
- 🗂️ Category-based ingredient searching
- 💻 Customizable ingredient database
- 📊 Confidence scoring for fuzzy matches

## Installation

```bash
npm install haircare-ingredients-analyzer
```

## Basic Usage

```typescript
import { Analyzer } from 'haircare-ingredients-analyzer';

// Create an analyzer with your ingredient database
const analyzer = new Analyzer({
  database: {
    ingredients: {
      "cetyl alcohol": {
        name: "Cetyl Alcohol",
        description: "A fatty alcohol that acts as an emollient",
        category: ["fatty alcohol", "emollient"],
        notes: "Common in conditioners",
        synonyms: ["hexadecan-1-ol"]
      }
    },
    categories: {
      alcohols: {
        name: "Alcohols",
        description: "Types of alcohols in hair care",
        categories: {
          "fatty alcohol": {
            name: "Fatty Alcohol",
            description: "Long-chain alcohols that condition",
            impact: "good",
            notes: "Beneficial for hair"
          }
        }
      }
    }
  }
});

// Analyze ingredients
const results = analyzer.analyzeIngredients("Water, Cetyl Alcohol");
console.log(results);
```

## Project Structure

The project is organized into two main parts:

### Core Library (`src/`)

Contains the core functionality:

```
src/
├── types/           # TypeScript interfaces
│   ├── index.ts     # Main type definitions
│   └── category.ts  # Category-specific types
├── utils/           # Core utilities
│   ├── analyzer.ts  # Main analysis logic
│   ├── matcher.ts   # Ingredient matching
│   ├── parser.ts    # List parsing
│   └── normalizer.ts # Name normalization
└── __tests__/       # Core library tests
```


## API Reference

### Analyzer Class

The main class for analyzing ingredients.

```typescript
class Analyzer {
  constructor(config?: Partial<AnalyzerConfig>);
  analyzeIngredients(ingredientString: string): AnalysisResult;
  findIngredientsByCategory(category: string): string[];
}
```

### Types

#### AnalyzerConfig

```typescript
interface AnalyzerConfig {
  database: {
    ingredients: Record<string, Ingredient>;
    categories: CategoryGroups;
  };
  fuzzyMatchThreshold?: number;
}
```

#### Ingredient

```typescript
interface Ingredient {
  name: string;
  description: string;
  category: string[];
  notes?: string;
  source?: string[];
  synonyms?: string[];
}
```

#### Category

```typescript
interface Category {
  name: string;
  description: string;
  impact: 'good' | 'caution' | 'bad';
  notes?: string;
  source?: string[];
}
```

#### AnalysisResult

```typescript
interface AnalysisResult {
  matches: IngredientMatch[];
  categories: string[];
}
```

#### IngredientMatch

```typescript
interface IngredientMatch {
  name: string;
  normalized: string;
  matched: boolean;
  details?: Ingredient;
  categories?: string[];
  fuzzyMatch?: boolean;
  confidence?: number;
  matchedSynonym?: string;
}
```

## Features in Detail

### Ingredient Matching

The analyzer supports multiple matching strategies:

1. **Exact Matching**: Direct matches of ingredient names
2. **Synonym Matching**: Matches alternative names for ingredients
3. **Fuzzy Matching**: Finds close matches using Fuse.js

### Category Analysis

Ingredients are categorized with:

- Multiple categories per ingredient
- Impact assessment (good/caution/bad)
- Detailed notes and descriptions
- Grouping by type (e.g., alcohols, silicones)

### Customization

You can customize:

- Ingredient definitions
- Category structures
- Fuzzy matching threshold
- Impact assessments

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

```

## License

MIT
