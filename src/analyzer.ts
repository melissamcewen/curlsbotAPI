import type {
  AnalyzerConfig,
  AnalyzerOptions,
  IngredientDatabase,
  AnalysisResult,
  System,
  Settings,
  IngredientMatch,
  Flags,
} from './types';
import { getBundledDatabase } from './data/bundledData';
import { getBundledSystems } from './data/bundledData';
import { getBundledSettings } from './data/bundledData';
import { normalizer } from './utils/normalizer';
import {
  findIngredient,
  getIngredientCategories,
  getCategoryGroups,
  findSystemById,
} from './utils/databaseUtils';
import { flag } from './utils/flagging';

export class Analyzer {
  private database: IngredientDatabase;
  private options?: AnalyzerOptions;
  private system: System;
  private settings: Settings;

  /**
   * Creates a new Analyzer instance
   * @param config Optional configuration. If not provided, uses bundled database
   */
  constructor(config?: Partial<AnalyzerConfig>) {
    this.database = config?.database ?? getBundledDatabase();
    this.options = config?.options;
    const bundledSystems = getBundledSystems();
    const defaultSystem = findSystemById(bundledSystems, 'curly_default');
    if (!defaultSystem) {
      throw new Error('Could not find curly_default system');
    }
    this.system = config?.system ?? defaultSystem;
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
   * Gets the current system
   */
  getSystem(): System {
    return this.system;
  }

  /**
   * Updates the current system
   */
  setSystem(system: System): void {
    this.system = system;
  }

  /**
   * Creates an empty analysis result with required fields
   */
  private createEmptyResult(): AnalysisResult {
    return {
      uuid: crypto.randomUUID(),
      input: '',
      normalized: [],
      system: '',
      status: 'pass',
      settings: [],
      matches: [],
      categories: [],
      groups: [],
      flags: [],
    };
  }

  /**
   * Analyzes an ingredient list and returns the results
   * @param ingredientList The ingredient list to analyze
   * @param systemId The ID of the system to use for analysis. If not provided or invalid, returns error
   */
  analyze(ingredientList: string, systemId = ''): AnalysisResult {
    if (!ingredientList || typeof ingredientList !== 'string') {
      const result = this.createEmptyResult();
      result.status = 'error';
      return result;
    }

    // Check if the requested system ID matches our system
    if (systemId && systemId !== this.system.id) {
      const result = this.createEmptyResult();
      result.status = 'error';
      result.system = systemId;
      return result;
    }

    const result = this.createEmptyResult();
    result.input = ingredientList;
    result.system = this.system.id;

    // Use the existing normalizer
    const normalized = normalizer(ingredientList);
    if (!normalized.isValid) {
      result.status = 'error';
      return result;
    }

    result.normalized = normalized.ingredients;

    // Match ingredients and collect categories/groups
    const allCategories = new Set<string>();
    const allGroups = new Set<string>();

    result.matches = normalized.ingredients.map((normalizedName) => {
      const match = findIngredient(this.database, normalizedName);
      const ingredient = match?.ingredient;
      const dbForCategories = this.database;

      const categories = ingredient
        ? getIngredientCategories(dbForCategories, ingredient.categories)
        : [];
      const groups = getCategoryGroups(dbForCategories, categories);

      // Add to overall categories and groups
      categories.forEach((c) => allCategories.add(c));
      groups.forEach((g) => allGroups.add(g));

      const matchResult: IngredientMatch = {
        uuid: crypto.randomUUID(),
        input: normalizedName,
        normalized: normalizedName,
        groups: groups,
        categories: categories,
        flags: [],
        ingredient: ingredient,
      };

      return matchResult;
    });

    // Set overall categories and groups
    result.categories = Array.from(allCategories);
    result.groups = Array.from(allGroups);

    // Apply flagging
    return flag(result, this.system, this.settings, this.database);
  }
}
