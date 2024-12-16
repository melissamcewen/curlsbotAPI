import type {
  AnalyzerConfig,
  AnalyzerOptions,
  IngredientDatabase,
  AnalysisResult,
  System,
  Settings,
  UserPreferences,
  FlagRule,
  IngredientMatch
} from './types';
import { getBundledDatabase } from './data/bundledData';
import { getBundledSystems } from './data/bundledData';
import { getBundledSettings } from './data/bundledData';
import { normalizer } from './utils/normalizer';
import { findIngredient, getIngredientCategories, getCategoryGroups } from './utils/databaseUtils';
import { getSystemFlags, mergeFlags } from './utils/flags';
import { getFlags, checkAvoidOthersInCategory } from './utils/flagging';

export class Analyzer {
  private database: IngredientDatabase;
  private options?: AnalyzerOptions;
  private systems: System[];
  private settings: Settings;
  private userPreferences?: UserPreferences;

  /**
   * Creates a new Analyzer instance
   * @param config Optional configuration. If not provided, uses bundled database
   */
  constructor(config?: Partial<AnalyzerConfig>) {
    this.database = config?.database ?? getBundledDatabase();
    this.options = config?.options;
    this.systems = config?.systems ?? getBundledSystems();
    this.settings = config?.settings ?? getBundledSettings();
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

    const normalized = normalizer(ingredientList);
    if (!normalized.isValid) {
      result.status = "error";
      return result;
    }

    result.normalized = normalized.ingredients;

    const allCategories = new Set<string>();
    const allGroups = new Set<string>();

    const system = this.systems.find(s => s.id === systemId);
    const systemFlags = getSystemFlags(system, this.settings);
    const mergedFlags = mergeFlags(systemFlags, this.options || {});

    result.matches = normalized.ingredients.map(normalizedName => {
      const match = findIngredient(this.database, normalizedName);
      const ingredient = match?.ingredient;
      const categories = ingredient ? getIngredientCategories(this.database, ingredient.categories) : [];
      const groups = getCategoryGroups(this.database, categories);

      categories.forEach(c => allCategories.add(c));
      groups.forEach(g => allGroups.add(g));

      // Get flags using the new utility functions
      const baseFlags = getFlags(
        normalizedName,
        ingredient,
        categories,
        groups,
        system,
        this.settings,
        mergedFlags
      );

      const avoidOthersFlags = checkAvoidOthersInCategory(
        normalizedName,
        categories,
        groups,
        system,
        this.settings,
        this.database.categories
      );

      const matchResult: IngredientMatch = {
        uuid: crypto.randomUUID(),
        input: normalizedName,
        normalized: normalizedName,
        categories,
        groups,
        ingredient,
        confidence: match?.confidence
      };

      const allFlags = [...new Set([...baseFlags, ...avoidOthersFlags])];
      if (allFlags.length > 0) {
        matchResult.flags = allFlags;
      }

      return matchResult;
    });

    result.categories = Array.from(allCategories);
    result.groups = Array.from(allGroups);

    const allFlags = new Set<string>();
    result.matches.forEach(match => {
      if (match.flags) {
        match.flags.forEach(flag => allFlags.add(flag));
      }
    });

    result.flags = {
      ...mergedFlags,
      flaggedIngredients: Array.from(allFlags).filter(flag =>
        result.matches.some(match => match.ingredient?.id === flag)
      ),
      flaggedCategories: Array.from(allFlags).filter(flag =>
        result.categories.includes(flag)
      ),
      flaggedGroups: Array.from(allFlags).filter(flag =>
        result.groups.includes(flag)
      )
    };

    if (system) {
      result.settings = system.settings;
    }

    return result;
  }

  // Add method to get a serializable configuration
  getConfiguration(): AnalyzerConfig {
    return {
      database: this.database,
      options: this.options,
      settings: this.settings
    };
  }

  // Add method to create analyzer from serialized config
  static fromConfiguration(config: AnalyzerConfig): Analyzer {
    return new Analyzer(config);
  }

  validateConfiguration(): boolean {
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
