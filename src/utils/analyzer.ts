import type {
  AnalyzerConfig,
  AnalysisResult,
  IngredientMatch,
  IngredientDatabase,
} from '../types';

import { normalizer } from './normalizer';
import { matchIngredient } from './matcher';
import { Flagger } from './flagger';

/**
 * Custom error class for Analyzer-specific errors
 */
export class AnalyzerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyzerError';
  }
}

/**
 * Creates an empty analysis result
 */
export const createEmptyResult = (): AnalysisResult => ({
  matches: [],
  categories: [],
  flags: {
    ingredients: [],
    categories: [],
    Groups: [],
  },
});

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
  private readonly database: IngredientDatabase;
  private readonly flagger: Flagger;

  /**
   * Creates a new Analyzer instance
   * @param config - Configuration containing the ingredient database
   */
  constructor(config: AnalyzerConfig) {
    if (!config?.database) {
      throw new AnalyzerError('Database configuration is required');
    }

    if (!Array.isArray(config.database.ingredients)) {
      throw new AnalyzerError(
        'Invalid database format: ingredients must be an array',
      );
    }

    this.database = config.database;
    this.flagger = new Flagger(this.database, config.options);
  }

  /**
   * Analyzes an ingredient list string and returns matches and their categories
   *
   * @param ingredientList - Comma-separated list of ingredients
   * @returns {AnalysisResult} Object containing matches and unique categories
   * @throws {AnalyzerError} If the input is invalid or processing fails
   *
   * @example
   * ```ts
   * const result = analyzer.analyze("Water, Cetyl Alcohol");
   * console.log(result.matches); // Array of matched ingredients
   * console.log(result.categories); // Array of unique categories
   * ```
   */
  public analyze(ingredientList: string): AnalysisResult {
    try {
      if (!ingredientList || typeof ingredientList !== 'string') {
        throw new AnalyzerError(
          'Invalid input: ingredient list must be a non-empty string',
        );
      }

      const normalized = this.normalizeIngredients(ingredientList);
      if (!normalized.isValid) {
        return createEmptyResult();
      }

      const matches = this.matchIngredients(normalized);
      const categories = this.extractCategories(matches);
      const flags = this.processFlags(matches);

      return {
        matches,
        categories,
        flags: {
          ingredients: [...new Set(flags.ingredients)],
          categories: [...new Set(flags.categories)],
          Groups: [...new Set(flags.Groups)],
        },
      };
    } catch (error) {
      if (error instanceof AnalyzerError) {
        throw error;
      }
      throw new AnalyzerError(
        `Failed to analyze ingredients: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Normalizes the ingredient list
   * @throws {AnalyzerError} If normalization fails
   */
  private normalizeIngredients(ingredientList: string): NormalizedResult {
    try {
      return normalizer(ingredientList);
    } catch (error) {
      throw new AnalyzerError(
        `Failed to normalize ingredients: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Matches ingredients against the database
   * @throws {AnalyzerError} If matching fails
   */
  private matchIngredients(
    normalized: NormalizedResult,
  ): readonly IngredientMatch[] {
    try {
      return normalized.ingredients.map(
        (ingredient: string): IngredientMatch => {
          if (!ingredient) {
            throw new AnalyzerError(
              'Empty ingredient found in normalized list',
            );
          }
          return matchIngredient(ingredient, this.database);
        },
      );
    } catch (error) {
      throw new AnalyzerError(
        `Failed to match ingredients: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Extracts unique categories from matches
   */
  private extractCategories(matches: readonly IngredientMatch[]): string[] {
    return [
      ...new Set(
        matches
          .filter(
            (match): match is IngredientMatch & { categories: string[] } =>
              Boolean(match.categories),
          )
          .flatMap((match) => match.categories),
      ),
    ];
  }

  /**
   * Processes flags for all matches
   */
  private processFlags(matches: readonly IngredientMatch[]) {
    const flags = {
      ingredients: [] as string[],
      categories: [] as string[],
      Groups: [] as string[],
    };

    matches.forEach((match) => {
      try {
        const result = this.flagger.getFlagsForMatch(match);
        flags.ingredients.push(...result.flags.ingredients);
        flags.categories.push(...result.flags.categories);
        flags.Groups.push(...result.flags.Groups);
        match.matchDetails = result.matchDetails;
      } catch (error) {
        console.warn(
          `Failed to process flags for match ${match.name}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    });

    return flags;
  }

  /**
   * Gets all known categories from the database
   * @throws {AnalyzerError} If database access fails
   */
  public getCategories(): string[] {
    try {
      if (!this.database.categories) {
        throw new AnalyzerError('Categories not found in database');
      }
      return this.database.categories.flatMap((group) =>
        group.categories.map((category) => category.id),
      );
    } catch (error) {
      throw new AnalyzerError(
        `Failed to get categories: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Gets all known ingredients from the database
   * @throws {AnalyzerError} If database access fails
   */
  public getIngredients(): string[] {
    try {
      if (!this.database.ingredients) {
        throw new AnalyzerError('Ingredients not found in database');
      }
      return this.database.ingredients.map((ingredient) => ingredient.id);
    } catch (error) {
      throw new AnalyzerError(
        `Failed to get ingredients: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
