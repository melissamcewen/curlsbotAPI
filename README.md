# Haircare Ingredients Analyzer

A comprehensive library for analyzing haircare product ingredients, with a focus on curly hair care methods and ingredient safety.

## Installation

```bash
npm install haircare-ingredients-analyzer
```

## Usage

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

## Features

- Ingredient parsing and normalization
- Categorization of ingredients
- Detailed information about common haircare ingredients
- Support for identifying potentially harmful ingredients
- Category-based ingredient searching

## API Reference

### analyzeIngredients(ingredientString: string): IngredientMatch[]

Analyzes a comma-separated string of ingredients and returns detailed information about each ingredient.

### findIngredientsByCategory(category: string): string[]

Returns an array of ingredient names that belong to the specified category.

## Types

```typescript
interface Ingredient {
  name: string;
  description: string;
  category: string[];
  notes?: string;
  source?: string[];
}

interface IngredientMatch {
  matched: boolean;
  name: string;
  details?: Ingredient;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT