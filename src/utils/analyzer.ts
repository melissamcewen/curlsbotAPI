import { IngredientMatch, IngredientAnalysisResult, AnalyzerConfig } from '../types';
import { parseIngredientList } from './parser';
import { createMatcher } from './matcher';

const defaultConfig: AnalyzerConfig = {
  database: {
    ingredients: {},
    categories: {}
  },
  fuzzyMatchThreshold: 0.3
};

export class Analyzer {
  private config: AnalyzerConfig;
  private matcher: ReturnType<typeof createMatcher>;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.matcher = createMatcher(this.config);
  }

  analyzeIngredients(ingredientString: string): IngredientAnalysisResult {
    const ingredientList = parseIngredientList(ingredientString);
    const matches = ingredientList.map(ingredient => this.matcher(ingredient));
    
    // Extract all unique categories from matched ingredients
    const categories = Array.from(new Set(
      matches
        .filter(match => match.matched && match.categories)
        .flatMap(match => match.categories!)
    )).sort();

    return {
      matches,
      categories
    };
  }

  findIngredientsByCategory(category: string): string[] {
    return Object.values(this.config.database.ingredients)
      .filter(ingredient => ingredient.category.includes(category))
      .map(ingredient => ingredient.name);
  }
}