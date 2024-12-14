import type { AnalyzerConfig, AnalyzerOptions, IngredientDatabase, AnalysisResult, System } from './types';
import { getDefaultDatabase } from './data/defaultDatabase';
import { normalizer } from './utils/normalizer';
import { findIngredient, getIngredientCategories, getCategoryGroups } from './utils/databaseUtils';
import { getSystemFlags, mergeFlags } from './utils/flags';

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
      const ingredient = findIngredient(this.database, normalizedName);
      const categories = ingredient ? getIngredientCategories(this.database, ingredient.categories) : [];
      const groups = getCategoryGroups(this.database, categories);

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
    const system = this.systems.find(s => s.id === systemId);
    const systemFlags = getSystemFlags(system);

    // Merge system flags with any configured options
    const mergedFlags = mergeFlags(systemFlags, this.options || {});

    // Apply flags to matches
    result.matches = result.matches.map(match => ({
      ...match,
      flags: [
        ...(match.ingredient && mergedFlags.flaggedIngredients?.includes(match.ingredient.id) ? [match.ingredient.id] : []),
        ...(match.categories.filter(c => mergedFlags.flaggedCategories?.includes(c)) || []),
        ...(match.groups.filter(g => mergedFlags.flaggedGroups?.includes(g)) || [])
      ]
    }));

    result.flags = mergedFlags;

    // Set system settings if a system was used
    if (system) {
      result.settings = system.settings;
    }

    return result;
  }
}
