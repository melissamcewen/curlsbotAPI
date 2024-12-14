import type { AnalyzerConfig, AnalyzerOptions, IngredientDatabase, AnalysisResult, System } from './types';
import { getDefaultDatabase } from './data/defaultDatabase';
import { normalizer } from './utils/normalizer';

export class Analyzer {
  private database: IngredientDatabase;
  private options?: AnalyzerOptions;
  private systems: System[];

  /**
   * Creates a new Analyzer instance
   * @param config Optional configuration. If not provided, uses default database
   */
  constructor(config?: Partial<AnalyzerConfig>) {
    this.database = config?.database ?? getDefaultDatabase();
    this.options = config?.options;
    // Load systems from config or use empty array
    this.systems = config?.systems ?? [];
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
   * Gets all available systems
   */
  getSystems(): System[] {
    return this.systems;
  }

  /**
   * Updates the available systems
   */
  setSystems(systems: System[]): void {
    this.systems = systems;
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
      status: "success",
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
   * Gets system-specific flags based on settings
   */
  private getSystemFlags(systemId: string): AnalyzerOptions {
    const system = this.systems.find(s => s.id === systemId);
    if (!system) return {};

    const flags: AnalyzerOptions = {
      flaggedIngredients: [],
      flaggedCategories: [],
      flaggedGroups: []
    };

    // Apply settings-based flags
    system.settings.forEach(setting => {
      // For now, we'll just handle sulfate_free as an example
      // This should be expanded based on settings.json
      if (setting === 'sulfate_free') {
        flags.flaggedCategories?.push('sulfates');
      }
      // Add more settings handling here
    });

    return flags;
  }

  /**
   * Analyzes an ingredient list and returns the results
   */
  analyze(ingredientList: string, systemId = ""): AnalysisResult {
    if (!ingredientList || typeof ingredientList !== 'string') {
      return this.createEmptyResult();
    }

    const result = this.createEmptyResult();
    result.input = ingredientList;
    result.system = systemId;

    // Use the existing normalizer
    const normalized = normalizer(ingredientList);
    if (!normalized.isValid) {
      result.status = "error";
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

    // Get system-specific flags
    const systemFlags = systemId ? this.getSystemFlags(systemId) : {};

    // Merge system flags with any configured options
    const flags = {
      ingredients: [] as string[],
      categories: [] as string[],
      groups: [] as string[]
    };

    // Apply system flags first
    if (systemFlags.flaggedIngredients) {
      flags.ingredients.push(...systemFlags.flaggedIngredients);
    }
    if (systemFlags.flaggedCategories) {
      flags.categories.push(...systemFlags.flaggedCategories);
    }
    if (systemFlags.flaggedGroups) {
      flags.groups.push(...systemFlags.flaggedGroups);
    }

    // Then apply any configured options
    if (this.options) {
      if (this.options.flaggedIngredients) {
        flags.ingredients.push(...this.options.flaggedIngredients);
      }
      if (this.options.flaggedCategories) {
        flags.categories.push(...this.options.flaggedCategories);
      }
      if (this.options.flaggedGroups) {
        flags.groups.push(...this.options.flaggedGroups);
      }
    }

    // Remove duplicates
    flags.ingredients = [...new Set(flags.ingredients)];
    flags.categories = [...new Set(flags.categories)];
    flags.groups = [...new Set(flags.groups)];

    result.flags = flags;

    // Set system settings if a system was used
    if (systemId) {
      const system = this.systems.find(s => s.id === systemId);
      if (system) {
        result.settings = system.settings;
      }
    }

    return result;
  }
}
