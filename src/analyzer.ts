import type {
  AnalyzerConfig,
  AnalyzerOptions,
  IngredientDatabase,
  AnalysisResult,
  System,
  Settings,
  UserPreferences,
  FlagRule,
  IngredientMatch,
  Flag,
  Flags
} from './types';
import { getBundledDatabase } from './data/bundledData';
import { getBundledSystems } from './data/bundledData';
import { getBundledSettings } from './data/bundledData';
import { normalizer } from './utils/normalizer';
import { findIngredient, getIngredientCategories, getCategoryGroups } from './utils/databaseUtils';
import { getSystemFlags, mergeFlags } from './utils/flags';

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
      flags: {}
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
    const systemFlags = getSystemFlags(system, this.settings);

    // Merge system flags with any configured options
    const mergedFlags = mergeFlags(systemFlags, this.options || {});

    result.matches = normalized.ingredients.map(normalizedName => {
      const match = findIngredient(this.database, normalizedName);
      const ingredient = match?.ingredient;
      const dbForCategories = this.database;

      const categories = ingredient ? getIngredientCategories(dbForCategories, ingredient.categories) : [];
      const groups = getCategoryGroups(dbForCategories, categories);

      // Add to overall categories and groups
      categories.forEach(c => allCategories.add(c));
      groups.forEach(g => allGroups.add(g));

      // Get flags from categories and system settings
      const flags = new Set<string>();

      // Add ingredient flags
      if (ingredient && mergedFlags.flaggedIngredients?.includes(ingredient.id)) {
        console.log(`Adding ingredient flag ${ingredient.id} for ${normalizedName}`);
        flags.add(ingredient.id);
      }

      // Add category flags
      categories.forEach(catId => {
        console.log(`Checking category ${catId} for ${normalizedName}`);
        console.log(`Merged flags:`, mergedFlags);
        // First check if the category is flagged
        if (mergedFlags.flaggedCategories?.includes(catId)) {
          console.log(`Adding category flag ${catId} for ${normalizedName}`);
          flags.add(catId);
        }
        // Then check settings that apply to this category
        if (system) {
          console.log(`System settings for ${normalizedName}:`, system.settings);
          system.settings.forEach(settingId => {
            const setting = this.settings[settingId];
            console.log(`Checking setting ${settingId} for ${normalizedName}:`, setting);
            if (setting) {
              // Handle avoid_others_in_category flag
              if (setting.flags?.includes('avoid_others_in_category')) {
                const settingCategories = setting.categories || [];
                settingCategories.forEach(settingCatId => {
                  const settingCategory = this.database.categories[settingCatId];
                  if (settingCategory) {
                    const categoryGroup = settingCategory.group;
                    // Get all categories in the same group
                    const categoriesInGroup = Object.values(this.database.categories)
                      .filter(cat => cat.group === categoryGroup)
                      .map(cat => cat.id);

                    // If ingredient has any categories in this group but none are in the allowed categories
                    const hasGroupCategories = categories.some(c => categoriesInGroup.includes(c));
                    const hasAllowedCategory = categories.some(c => settingCategories.includes(c));

                    if (hasGroupCategories && !hasAllowedCategory) {
                      console.log(`Adding avoid_others_in_category flag ${settingId} for ${normalizedName}`);
                      flags.add(settingId);
                    }
                  }
                });
              } else if (categories.some(catId => setting.categories?.includes(catId))) {
                console.log(`Setting ${settingId} matches category for ${normalizedName}`);
                if (setting.flags) {
                  console.log(`Adding setting flags ${setting.flags} for ${normalizedName} from setting ${settingId}`);
                  setting.flags.forEach(flag => {
                    console.log(`Adding individual flag ${flag} for ${normalizedName}`);
                    flags.add(flag);
                  });
                }
              }
            }
          });
        }
      });

      // Also check if any ingredient categories are in a group that has avoid_others_in_category
      groups.forEach(groupId => {
        console.log(`Checking group ${groupId} for ${normalizedName}`);
        system?.settings.forEach(settingId => {
          const setting = this.settings[settingId];
          if (setting?.flags?.includes('avoid_others_in_category')) {
            const settingCategories = setting.categories || [];
            settingCategories.forEach(settingCatId => {
              const settingCategory = this.database.categories[settingCatId];
              if (settingCategory && settingCategory.group === groupId && !categories.some(c => settingCategories.includes(c))) {
                console.log(`Adding avoid_others_in_category flag ${settingId} for ${normalizedName} from group check`);
                flags.add(settingId);
              }
            });
          }
        });
      });

      // Add group flags
      groups.forEach(groupId => {
        console.log(`Checking group ${groupId} for ${normalizedName}`);
        if (mergedFlags.flaggedGroups?.includes(groupId)) {
          console.log(`Adding group flag ${groupId} for ${normalizedName}`);
          flags.add(groupId);
        }
      });

      const matchResult: IngredientMatch = {
        uuid: crypto.randomUUID(),
        input: normalizedName,
        normalized: normalizedName,
        groups: groups,
        categories: categories,
        flags: Array.from(flags),
        ingredient: ingredient,
        confidence: match?.confidence
      };

      return matchResult;
    });

    // Set overall categories and groups
    result.categories = Array.from(allCategories);
    result.groups = Array.from(allGroups);

    // Collect all flags from matches
    const flags: Flags = {};
    result.matches.forEach(match => {
      if (match.flags) {
        match.flags.forEach(flagId => {
          const setting = this.settings[flagId];
          if (!setting) return;

          // Create flag from setting if we haven't already
          if (!flags[flagId]) {
            flags[flagId] = {
              id: flagId,
              name: setting.name,
              description: setting.description,
              type: match.ingredient ? 'ingredient' :
                    match.categories?.length ? 'category' : 'group',
              flag_type: setting.flags[0] as 'avoid' | 'prefer' | 'avoid_others_in_category' | 'caution'
            };
          }
        });
      }
    });

    // Set the flags in the result
    result.flags = flags;

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
