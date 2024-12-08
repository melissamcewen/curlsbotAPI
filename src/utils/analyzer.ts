import {
  AnalyzerConfig,
  AnalysisResult,
  IngredientMatch,
  IngredientDatabase
} from '../types';
import { normalizer } from './normalizer';
import { matchIngredient } from './matcher';

/**
 * Analyzes cosmetic ingredient lists and matches ingredients against a database
 */
export class Analyzer {
  private database: IngredientDatabase;

  constructor(config: AnalyzerConfig) {
    this.database = config.database;
  }

  /**
   * Analyzes an ingredient list string and returns matches and their categories
   *
   * @param ingredientList - Raw ingredient list string to analyze
   * @returns Analysis result containing matches and unique categories
   *
   * @example
   * ```ts
   * const analyzer = new Analyzer({ database });
   * const result = analyzer.analyze("water, alcohol denat, glycerin");
   * ```
   */
  public analyze(ingredientList: string): AnalysisResult {
    // Normalize the ingredient list
    const normalized = normalizer(ingredientList);

    if (!normalized.isValid) {
      return {
        matches: [],
        categories: []
      };
    }

    // Get matches for each normalized ingredient
    const matches: IngredientMatch[] = normalized.ingredients.flatMap(ingredient =>
      matchIngredient(ingredient, this.database)
    );

    // Collect unique categories from all matches
    const categories = [...new Set(
      matches
        .filter(match => match.categories)
        .flatMap(match => match.categories || [])
    )];

    return {
      matches,
      categories
    };
  }

  /**
   * Gets all known categories from the database
   * @returns Array of category names
   */
  public getCategories(): string[] {
    return Object.values(this.database.categories)
      .flatMap(group => Object.keys(group.categories));
  }

  /**
   * Gets all known ingredients from the database
   * @returns Array of ingredient names
   */
  public getIngredients(): string[] {
    return Object.keys(this.database.ingredients);
  }
}
