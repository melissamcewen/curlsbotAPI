import type { AnalyzerConfig, AnalyzerOptions, IngredientDatabase, AnalysisResult } from './types';
import { getDefaultDatabase } from './data/defaultDatabase';

export class Analyzer {
  private database: IngredientDatabase;
  private options?: AnalyzerOptions;

  /**
   * Creates a new Analyzer instance
   * @param config Optional configuration. If not provided, uses default database
   */
  constructor(config?: Partial<AnalyzerConfig>) {
    this.database = config?.database ?? getDefaultDatabase();
    this.options = config?.options;
  }

  /**
   * Gets the current database being used by the analyzer
   */
  getDatabase(): IngredientDatabase {
    return this.database;
  }

  /**
   * Updates the database being used by the analyzer
   * @param database The new database to use
   */
  setDatabase(database: IngredientDatabase): void {
    this.database = database;
  }

  /**
   * Gets the current analyzer options
   */
  getOptions(): AnalyzerOptions | undefined {
    return this.options;
  }

  /**
   * Updates the analyzer options
   * @param options The new options to use
   */
  setOptions(options: AnalyzerOptions): void {
    this.options = options;
  }

  /**
   * Gets all ingredients from the database
   */
  getIngredients() {
    return this.database.ingredients;
  }

  /**
   * Gets all categories from the database
   */
  getCategories() {
    return this.database.categories;
  }

  /**
   * Gets all groups from the database
   */
  getGroups() {
    return this.database.groups;
  }

  /**
   * Creates an empty analysis result with required fields
   */
  private createEmptyResult(): AnalysisResult {
    return {
      uuid: crypto.randomUUID(),
      input: "",
      normalized: [],
      system: "",
      status: "",
      settings: [],
      matches: [],
      categories: [],
      groups: [],
      flags: {
        ingredients: [],
        categories: [],
        groups: []
      }
    };
  }

  /**
   * Analyzes an ingredient list and returns the results
   * @param ingredientList The ingredient list to analyze
   * @param system Optional system to use for analysis
   */
  analyze(ingredientList: string, system = ""): AnalysisResult {
    if (!ingredientList || typeof ingredientList !== 'string') {
      return this.createEmptyResult();
    }

    // TODO: Implement actual analysis logic
    const result = this.createEmptyResult();
    result.input = ingredientList;
    result.system = system;

    return result;
  }
}
