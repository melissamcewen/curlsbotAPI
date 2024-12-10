import {
  AnalyzerConfig,
  AnalysisResult,
  IngredientMatch,
  IngredientDatabase
} from '@/types';
import { normalizer } from './normalizer';
import { matchIngredient } from './matcher';

/**
 * Analyzes cosmetic ingredient lists and matches ingredients against a database
 *
 * @remarks
 * The Analyzer class provides methods to:
 * - Analyze ingredient lists and identify known ingredients
 * - Match ingredients against categories
 * - Retrieve all known ingredients and categories
 *
 * @example
 * ```ts
 * const analyzer = new Analyzer({ database });
 * const result = analyzer.analyze("Water, Cetyl Alcohol");
 * ```
 */
export class Analyzer {
  /** The ingredient database used for matching */
  private database: IngredientDatabase;

  /**
   * Creates a new Analyzer instance
   * @param config - Configuration containing the ingredient database
   */
  constructor(config: AnalyzerConfig) {
    this.database = config.database;
  }

  /**
   * Analyzes an ingredient list string and returns matches and their categories
   *
   * @param ingredientList - Comma-separated list of ingredients
   * @returns {AnalysisResult} Object containing matches and unique categories
   * @throws Never throws
   *
   * @example
   * ```ts
   * const result = analyzer.analyze("Water, Cetyl Alcohol");
   * console.log(result.matches); // Array of matched ingredients
   * console.log(result.categories); // Array of unique categories
   * ```
   */
  public analyze(ingredientList: string): AnalysisResult {
    // Normalize the ingredient list
    const normalized = normalizer(ingredientList);

    if (!normalized.isValid) {
      return {
        matches: [],
        categories: [],
      };
    }

    // Get matches for each normalized ingredient
    const matches: IngredientMatch[] = normalized.ingredients.map(
      (ingredient) => {
        const match = matchIngredient(ingredient, this.database);
        return match as IngredientMatch; // We know it's a single match since we're not using returnAllMatches
      },
    );

    // Collect unique categories from all matches
    const categories = [
      ...new Set(
        matches
          .filter((match) => match.categories)
          .flatMap((match) => match.categories || []),
      ),
    ];

    return {
      matches,
      categories,
    };
  }

  /**
   * Gets all known categories from the database
   * @returns Array of lowercase category names
   */
  public getCategories(): string[] {
    return this.database.categories.flatMap(group =>
      group.categories.map(category => category.name.toLowerCase())
    );
  }

  /**
   * Gets all known ingredients from the database
   * @returns Array of lowercase ingredient names
   */
  public getIngredients(): string[] {
    return this.database.ingredients.map((ingredient) =>
      ingredient.name.toLowerCase(),
    );
  }
}
