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
    const matches: IngredientMatch[] = normalized.ingredients.map(ingredient => {
      const match = matchIngredient(ingredient, this.database);
      return match as IngredientMatch; // We know it's a single match since we're not using returnAllMatches
    });

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
   */
  public getCategories(): string[] {
    return Object.values(this.database.categories)
      .flatMap(group => Object.keys(group.categories));
  }

  /**
   * Gets all known ingredients from the database
   */
  public getIngredients(): string[] {
    return Object.keys(this.database.ingredients);
  }
}
