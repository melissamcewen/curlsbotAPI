# Cosmetic Ingredient Analyzer

A TypeScript library for analyzing cosmetic ingredient lists. It normalizes ingredient names and matches them against a database of known ingredients and categories.

## Features

- Normalizes ingredient lists (handles parentheses, line breaks, and special characters)
- Matches ingredients using multiple strategies:
  - Exact matches (confidence: 1.0)
  - Partial matches (confidence: 0.7)
  - Category matches (confidence: 0.8)
  - Category group matches (confidence: 0.5)
- Validates ingredient lists and individual ingredients
- Debug mode for viewing all potential matches
- TypeScript support with full type definitions

## Installation

```bash
npm install cosmetic-ingredient-analyzer
```

## Usage

```typescript
import { Analyzer } from 'cosmetic-ingredient-analyzer';

// Initialize with your ingredient database
const analyzer = new Analyzer({
  database: {
    ingredients: {
      cetyl_alcohol: {
        name: 'Cetyl Alcohol',
        description: 'A fatty alcohol that acts as an emollient',
        category: ['fatty alcohol'],
        synonyms: ['cetearyl alcohol'],
      },
    },
    categories: {
      alcohols: {
        name: 'Alcohols',
        description: 'Different types of alcohols used in hair care',
        categories: {
          'fatty alcohol': {
            name: 'Fatty Alcohol',
            description: 'Long-chain alcohols that condition',
            tags: ['Curly Friendly'],
            notes: 'Beneficial for hair',
          },
        },
        matchConfig: {
          partials: ['alcohol'],
        },
      },
    },
  },
});

// Analyze an ingredient list
const result = analyzer.analyze('Water, Cetyl Alcohol, Fragrance');
console.log(result.matches); // Array of matched ingredients
console.log(result.categories); // Array of unique categories found

// Get individual ingredient match with debug info
const match = matchIngredient('cetyl alcohol', database, { debug: true });
console.log(match.matchDetails); // Details about the match
console.log(match.debug?.allMatches); // All possible matches if debug enabled
```

## Types

### IngredientMatch

```typescript
interface IngredientMatch {
  name: string; // Original ingredient name
  normalized: string; // Normalized version
  details?: Ingredient; // Full ingredient details if matched
  categories?: string[]; // Categories this ingredient belongs to
  matchDetails?: MatchDetails; // Match information
  debug?: DebugInfo; // Debug information if requested
}
```

### MatchDetails

```typescript
interface MatchDetails {
  matched: boolean;
  matchTypes: MatchType[]; // Types of matches found
  searchType: MatchSearch; // Where the match was found
  confidence: number; // Confidence score (0-1)
  matchedOn?: string[]; // What strings matched
}
```

### Database Structure

```typescript
interface IngredientDatabase {
  ingredients: Record<string, Ingredient>;
  categories: CategoryGroups;
}

interface Ingredient {
  name: string;
  description?: string;
  category: string[];
  synonyms?: string[];
  matchConfig?: MatchConfig;
}

interface CategoryGroup {
  name: string;
  description: string;
  categories: Record<string, Category>;
  matchConfig?: MatchConfig;
}
```

## Match Types

The library supports different types of matches:

- `exactMatch`: Direct match with ingredient name or synonym (confidence: 1.0)
- `partialMatch`: Partial text match with configured patterns (confidence: 0.7)
- `categoryMatch`: Match with a specific category (confidence: 0.8)
- `categoryGroupMatch`: Match with a category group (confidence: 0.5)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Flagging Ingredients

The analyzer can flag ingredients based on specific criteria. This is useful for highlighting ingredients of interest or concern.

### Configuration

Configure flagging by passing options to the analyzer:

```typescript
const analyzer = new Analyzer({
  database: ingredientDatabase,
  options: {
    // Flag specific ingredients (case insensitive)
    flaggedIngredients: ['sodium lauryl sulfate', 'benzyl alcohol'],

    // Flag any ingredients in these categories
    flaggedCategories: ['sulfate', 'solvent alcohol'],

    // Flag any ingredients in these category groups
    flaggedCategoryGroups: ['Alcohols']
  }
});
```

### Analysis Results

When using flagging, the analysis results include a flags object:

```typescript
const result = analyzer.analyze('Water, Sodium Lauryl Sulfate, Benzyl Alcohol');

console.log(result.flags);
// {
//   ingredients: ['sodium lauryl sulfate', 'benzyl alcohol'],
//   categories: ['sulfate', 'solvent alcohol'],
//   categoryGroups: ['Alcohols']
// }

// Each matched ingredient also includes flagging information
console.log(result.matches[0].matchDetails.flagged); // true/false
```

### Flag Types

- `flaggedIngredients`: Flags specific ingredients by name (including synonyms)
- `flaggedCategories`: Flags any ingredients that belong to specified categories
- `flaggedCategoryGroups`: Flags any ingredients that belong to specified category groups

All flagging is case-insensitive for easier matching.
