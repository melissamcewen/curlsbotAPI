import type { AnalyzerConfig, AnalyzerOptions, IngredientDatabase, AnalysisResult } from './types';
import { getDefaultDatabase } from './data/defaultDatabase';
import { normalizer } from './utils/normalizer';

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
   * Finds an ingredient in the database by name or synonym
   */
  private findIngredient(normalizedName: string) {
    return Object.values(this.database.ingredients).find(ingredient => {
      if (ingredient.name.toLowerCase() === normalizedName) {
        return true;
      }
      if (ingredient.synonyms) {
        return ingredient.synonyms.some(s => s.toLowerCase() === normalizedName);
      }
      return false;
    });
  }

  /**
   * Gets categories for an ingredient
   */
  private getIngredientCategories(ingredient: string | string[]): string[] {
    const categories = Array.isArray(ingredient) ? ingredient : [ingredient];
    return categories.flatMap(catId => {
      const category = this.database.categories[catId];
      return category ? [category.id] : [];
    });
  }

  /**
   * Gets groups for categories
   */
  private getCategoryGroups(categories: string[]): string[] {
    return categories.flatMap(catId => {
      const category = this.database.categories[catId];
      return category?.group ? [category.group] : [];
    });
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
   */
  analyze(ingredientList: string, system = ""): AnalysisResult {
    if (!ingredientList || typeof ingredientList !== 'string') {
      return this.createEmptyResult();
    }

    const result = this.createEmptyResult();
    result.input = ingredientList;
    result.system = system;

    // Use the existing normalizer
    const normalized = normalizer(ingredientList);
    if (!normalized.isValid) {
      return result;
    }

    result.normalized = normalized.ingredients;

    // Match ingredients and collect categories/groups
    const allCategories = new Set<string>();
    const allGroups = new Set<string>();

    result.matches = normalized.ingredients.map(normalizedName => {
      const ingredient = this.findIngredient(normalizedName);
      const categories = ingredient ? this.getIngredientCategories(ingredient.categories) : [];
      const groups = this.getCategoryGroups(categories);

      // Add to overall categories and groups
      categories.forEach(c => allCategories.add(c));
      groups.forEach(g => allGroups.add(g));

      return {
        uuid: crypto.randomUUID(),
        input: normalizedName,
        normalized: normalizedName,
        categories,
        groups,
        flags: [],
        ingredient
      };
    });

    // Set overall categories and groups
    result.categories = Array.from(allCategories);
    result.groups = Array.from(allGroups);

    // Apply flags if options are set
    if (this.options) {
      const flags = {
        ingredients: [] as string[],
        categories: [] as string[],
        groups: [] as string[]
      };

      // Check flagged ingredients
      if (this.options.flaggedIngredients) {
        flags.ingredients = result.matches
          .filter(m => m.ingredient && this.options?.flaggedIngredients?.includes(m.ingredient.id))
          .map(m => m.ingredient!.id);
      }

      // Check flagged categories
      if (this.options.flaggedCategories) {
        flags.categories = result.categories
          .filter(c => this.options?.flaggedCategories?.includes(c));
      }

      // Check flagged groups
      if (this.options.flaggedGroups) {
        flags.groups = result.groups
          .filter(g => this.options?.flaggedGroups?.includes(g));
      }

      result.flags = flags;
    }

    return result;
  }
}
