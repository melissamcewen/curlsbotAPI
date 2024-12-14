# Haircare Ingredients Analyzer

A TypeScript library for analyzing haircare product ingredients. It normalizes ingredient names, matches them against a database of known ingredients, and identifies categories and potential flags.

## Features

- Normalizes ingredient lists (handles parentheses, line breaks, and special characters)
- Fuzzy matching using FlexSearch for ingredient identification
- Categorizes ingredients into groups (e.g., Alcohols, Silicones, Cleansers)
- Flags ingredients based on configurable criteria
- Debug mode for viewing all potential matches
- TypeScript support with full type definitions
- Zero runtime dependencies (except FlexSearch and UUID)

## Installation

```bash
npm install haircare-ingredients-analyzer
```

## Usage

```typescript
import { Analyzer } from 'haircare-ingredients-analyzer';

// Initialize with your ingredient database
const analyzer = new Analyzer({
  database: {
    ingredients: [
      {
        id: 'cetyl-alcohol',
        name: 'Cetyl Alcohol',
        description: 'A fatty alcohol that acts as an emollient',
        category: ['fatty alcohol'],
        synonyms: ['cetearyl alcohol'],
      },
    ],
    categories: [
      {
        name: 'Alcohols',
        description: 'Different types of alcohols used in hair care',
        categories: [
          {
            name: 'Fatty Alcohol',
            description: 'Long-chain alcohols that condition',
            tags: ['Curly Friendly'],
          },
        ],
      },
    ],
  },
  options: {
    flaggedIngredients: ['sodium lauryl sulfate'],
    flaggedCategories: ['sulfate'],
    flaggedGroups: ['Alcohols'],
  },
});

// Analyze an ingredient list
const result = analyzer.analyze('Water, Cetyl Alcohol, Fragrance');
console.log(result.matches); // Array of matched ingredients
console.log(result.categories); // Array of unique categories
console.log(result.flags); // Flagged ingredients/categories

// Get all known ingredients and categories
const ingredients = analyzer.getIngredients();
const categories = analyzer.getCategories();
```

## Key Types

### AnalysisResult

```typescript
interface AnalysisResult {
  matches: IngredientMatch[];
  categories: string[];
  flags?: {
    ingredients: string[];
    categories: string[];
    Groups: string[];
  };
}
```

### IngredientMatch

```typescript
interface IngredientMatch {
  id: string;
  name: string;
  normalized: string;
  details?: Ingredient;
  categories?: string[];
  matchDetails?: MatchDetails;
  debug?: DebugInfo;
}
```

### Database Structure

```typescript
interface IngredientDatabase {
  ingredients: Ingredient[];
  categories: Groups;
}

interface Ingredient {
  id: string;
  name: string;
  description?: string;
  category: string[];
  synonyms?: string[];
  matchConfig?: MatchConfig;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Testing

Test number as of 12/13/2024: 49
