import type {
  AnalyzerConfig,
  AnalyzerOptions,
  IngredientDatabase,
  AnalysisResult,
  System,
  FlagRule,
  UserPreferences
} from './types';
import { getDefaultDatabase } from './data/defaultDatabase';
import { normalizer } from './utils/normalizer';
import { findIngredient, getIngredientCategories, getCategoryGroups } from './utils/databaseUtils';
import { getSystemFlags, mergeFlags } from './utils/flags';
import { loadSystems } from './utils/configLoader';

export class Analyzer {
  private database: IngredientDatabase;
  private fallbackDatabase?: IngredientDatabase;
  private options?: AnalyzerOptions;
  private systems: System[];
  private configDir?: string;
  private userPreferences?: UserPreferences;

  /**
   * Creates a new Analyzer instance
   * @param config Optional configuration. If not provided, uses default database
   */
  constructor(config?: Partial<AnalyzerConfig>) {
    this.database = config?.database ?? getDefaultDatabase();
    this.fallbackDatabase = config?.fallbackDatabase;
    this.options = config?.options;
    this.configDir = config?.configDir;
    this.systems = loadSystems({ configDir: this.configDir });
  }

  /**
   * Gets the current database being used by the analyzer
   */
  getDatabase(): IngredientDatabase {
    return this.database;
  }

  /**
   * Gets the current fallback database being used by the analyzer
   */
  getFallbackDatabase(): IngredientDatabase | undefined {
    return this.fallbackDatabase;
  }

  /**
   * Updates the database being used by the analyzer
   * @param database The new database to use
   */
  setDatabase(database: IngredientDatabase): void {
    this.database = database;
  }

  /**
   * Updates the fallback database being used by the analyzer
   * @param database The new fallback database to use
   */
  setFallbackDatabase(database: IngredientDatabase): void {
    this.fallbackDatabase = database;
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
        flaggedIngredients: [],
        flaggedCategories: [],
        flaggedGroups: []
      }
    };
  }

  /**
   * Analyzes an ingredient list and returns the results
   */
  analyze(ingredientList: string, systemId = ""): AnalysisResult {
    if (!ingredientList || typeof ingredientList !== 'string') {
      const result = this.createEmptyResult();
      result.status = "error";
      return result;
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

    // Get system-specific flags
    const system = this.systems.find(s => s.id === systemId);
    const systemFlags = getSystemFlags(system, { configDir: this.configDir });

    // Merge system flags with any configured options
    const mergedFlags = mergeFlags(systemFlags, this.options || {});

    result.matches = normalized.ingredients.map(normalizedName => {
      const ingredient = findIngredient(this.database, normalizedName, this.fallbackDatabase);

      // Determine which database to use for categories and groups
      const dbForCategories = ingredient && this.fallbackDatabase?.ingredients[ingredient.id]
        ? this.fallbackDatabase
        : this.database;

      const categories = ingredient ? getIngredientCategories(dbForCategories, ingredient.categories) : [];
      const groups = getCategoryGroups(dbForCategories, categories);

      // Add to overall categories and groups
      categories.forEach(c => allCategories.add(c));
      groups.forEach(g => allGroups.add(g));

      // Get flags from categories and system settings
      const flags = new Set<string>();

      // Add ingredient flags
      if (ingredient && mergedFlags.flaggedIngredients?.includes(ingredient.id)) {
        flags.add(ingredient.id);
      }

      // Add category flags
      categories.forEach(catId => {
        if (mergedFlags.flaggedCategories?.includes(catId)) {
          flags.add(catId);
        }
      });

      // Add group flags
      groups.forEach(groupId => {
        if (mergedFlags.flaggedGroups?.includes(groupId)) {
          flags.add(groupId);
        }
      });

      return {
        uuid: crypto.randomUUID(),
        input: normalizedName,
        normalized: normalizedName,
        categories,
        groups,
        flags: Array.from(flags),
        ingredient
      };
    });

    // Set overall categories and groups
    result.categories = Array.from(allCategories);
    result.groups = Array.from(allGroups);

    result.flags = mergedFlags;

    // Set system settings if a system was used
    if (system) {
      result.settings = system.settings;
    }

    return result;
  }

  // Add method to get a serializable configuration
  getConfiguration(): AnalyzerConfig {
    return {
      database: this.database,
      fallbackDatabase: this.fallbackDatabase,
      options: this.options,
      configDir: this.configDir
    };
  }

  // Add method to create analyzer from serialized config
  static fromConfiguration(config: AnalyzerConfig): Analyzer {
    return new Analyzer(config);
  }

  validateConfiguration(config: Partial<AnalyzerConfig>): boolean {
    // Add validation logic here
    return true;
  }

  /**
   * Sets user preferences for flagging ingredients/categories/groups
   */
  setUserPreferences(preferences: UserPreferences): void {
    this.userPreferences = preferences;

    // Convert preferences to analyzer options
    this.options = {
      flaggedIngredients: preferences.rules
        .filter(r => r.type === 'ingredient')
        .map(r => r.id),
      flaggedCategories: preferences.rules
        .filter(r => r.type === 'category')
        .map(r => r.id),
      flaggedGroups: preferences.rules
        .filter(r => r.type === 'group')
        .map(r => r.id)
    };
  }

  /**
   * Gets current user preferences
   */
  getUserPreferences(): UserPreferences | undefined {
    return this.userPreferences;
  }

  /**
   * Gets available rules that can be flagged
   */
  getAvailableRules(): FlagRule[] {
    const rules: FlagRule[] = [];

    // Add ingredient rules
    Object.values(this.database.ingredients).forEach(ing => {
      rules.push({
        id: ing.id,
        name: ing.name,
        type: 'ingredient'
      });
    });

    // Add category rules
    Object.values(this.database.categories).forEach(cat => {
      rules.push({
        id: cat.id,
        name: cat.name,
        type: 'category'
      });
    });

    // Add group rules
    Object.values(this.database.groups).forEach(group => {
      rules.push({
        id: group.id,
        name: group.name,
        type: 'group'
      });
    });

    return rules;
  }
}
