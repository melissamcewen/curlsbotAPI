import type {
  AnalyzerConfig,
  IngredientDatabase,
  AnalysisResult,
  System,
  Settings,
  IngredientResult,
  StatusReason,
  Setting
} from './types';
import { getBundledDatabase } from './data/bundledData';
import { getBundledSystems } from './data/bundledData';
import { getBundledSettings } from './data/bundledData';
import { normalizer } from './utils/normalizer';
import { findIngredient, findSystemById } from './utils/databaseUtils';

export class Analyzer {
  private database: IngredientDatabase;
  private system: System;
  private settings: Settings;

  constructor(config?: Partial<AnalyzerConfig>) {
    this.database = config?.database ?? getBundledDatabase();
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
   */
  setDatabase(database: IngredientDatabase): void {
    this.database = database;
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
   * Creates an empty analysis result
   */
  private createEmptyResult(input: string): AnalysisResult {
    return {
      input,
      status: 'error',
      reasons: [],
      ingredients: []
    };
  }

  /**
   * Analyzes a single ingredient against the current system's settings
   */
  private analyzeIngredient(name: string, normalized: string): IngredientResult {
    const result: IngredientResult = {
      name,
      normalized,
      status: 'ok',
      reasons: []
    };

    // Try to find the ingredient in the database
    const match = findIngredient(this.database, normalized);
    if (match?.ingredient) {
      result.ingredient = {
        id: match.ingredient.id,
        name: match.ingredient.name,
        description: match.ingredient.description
      };
    } else {
      // Unknown ingredient gets a caution status
      result.status = 'caution';
      result.reasons.push({
        setting: 'unknown_ingredient',
        reason: 'Ingredient not found in database'
      });
      return result;
    }

    // Check each active setting
    for (const settingId of this.system.settings) {
      const setting = this.settings[settingId];
      if (!setting) continue;

      let matches = false;
      let allowedMatch = false;

      // Check if ingredient matches any categories
      if (setting.categories) {
        matches = match.ingredient.categories.some(cat => setting.categories?.includes(cat));
      }

      // Check if ingredient matches any groups via its categories
      if (setting.groups) {
        matches = matches || match.ingredient.categories.some(catId => {
          const category = this.database.categories[catId];
          return category && setting.groups?.includes(category.group);
        });

        // If it matches a group, check if it's in allowed categories
        if (matches && setting.allowedCategories) {
          allowedMatch = match.ingredient.categories.some(cat =>
            setting.allowedCategories?.includes(cat)
          );
        }
      }

      // Check direct ingredient matches
      if (setting.ingredients) {
        matches = matches || setting.ingredients.includes(match.ingredient.id);
      }

      if (matches) {
        // Add the reason
        const status = allowedMatch ? setting.allowedStatus : setting.defaultStatus;
        result.reasons.push({
          setting: setting.id,
          reason: setting.description
        });

        // Update status (warning > caution > ok)
        if (status === 'warning') {
          result.status = 'warning';
        } else if (status === 'caution' && result.status === 'ok') {
          result.status = 'caution';
        }
      }
    }

    return result;
  }

  /**
   * Analyzes an ingredient list and returns the results
   */
  analyze(ingredientList: string): AnalysisResult {
    // Handle invalid input
    if (!ingredientList || typeof ingredientList !== 'string') {
      return this.createEmptyResult('');
    }

    const result = this.createEmptyResult(ingredientList);

    // Normalize the ingredient list
    const normalized = normalizer(ingredientList);
    if (!normalized.isValid) {
      return result;
    }

    // Analyze each ingredient
    result.ingredients = normalized.ingredients.map((normalizedName: string) => {
      return this.analyzeIngredient(normalizedName, normalizedName);
    });

    // Determine overall status and reasons
    result.status = 'ok';
    const uniqueReasons = new Map<string, StatusReason>();

    for (const ingredient of result.ingredients) {
      // Update overall status (warning > caution > ok)
      if (ingredient.status === 'warning') {
        result.status = 'warning';
      } else if (ingredient.status === 'caution' && result.status === 'ok') {
        result.status = 'caution';
      }

      // Collect unique reasons
      for (const reason of ingredient.reasons) {
        const key = `${reason.setting}:${reason.reason}`;
        if (!uniqueReasons.has(key)) {
          uniqueReasons.set(key, reason);
        }
      }
    }

    result.reasons = Array.from(uniqueReasons.values());
    return result;
  }
}
