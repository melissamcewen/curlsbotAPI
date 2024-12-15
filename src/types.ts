/**
 * Represents configuration options for the analyzer
 */
export interface AnalyzerConfig {
  /** Ingredient database used for analysis */
  database: IngredientDatabase;
  /** Optional fallback database used when ingredients aren't found in main database */
  fallbackDatabase?: IngredientDatabase;
  /** Optional analyzer options */
  options?: AnalyzerOptions;
  /** Optional path to config directory */
  configDir?: string;
  /** Optional systems used to analyze the input */
  systems?: System[];
  /** Optional settings for the systems */
  settings?: Settings;
}

/**
 * Specifies options to customize the analyzer's behavior
 */
export interface AnalyzerOptions {
  /** List of flagged ingredient names */
  flaggedIngredients?: string[];
  /** List of flagged ingredient categories by id */
  flaggedCategories?: string[];
  /** List of flagged ingredient category groups by id */
  flaggedGroups?: string[];
}

/**
 * Represents the result of an analysis
 */
export interface AnalysisResult {
  /** Unique identifier for the result */
  uuid: string;
  /** Original input */
  input: string;
  /** Normalized input */
  normalized: readonly string[];
  /** System used to analyze the input */
  system: string;
  /** Status of the analysis */
  status: string;
  /** List of settings that were matched */
  settings: string[];
  /** List of matching ingredients */
  matches: IngredientMatch[];
  /** List of categories */
  categories: string[];
  /** List of groups */
  groups: string[];
  /** Flags for ingredients, categories, and category groups */
  flags: {
    /** Ingredients that are flagged */
    flaggedIngredients: string[];
    /** Categories that are flagged */
    flaggedCategories: string[];
    /** Category groups that are flagged */
    flaggedGroups: string[];
  };
}

/**
 * Represents a category for ingredients
 */
export interface Category {
  /** Display name of the category */
  name: string;
  /** Description of the category and its effects */
  description: string;
  /** Unique identifier in snake_case */
  id: string;
  /** The group this category belongs to */
  group: string;
}

/**
 * Represents a group of related categories
 */
export interface Group {
  /** Name of the category group */
  name: string;
  /** Description of the category group */
  description?: string;
  /** Unique identifier for the category group */
  id: string;
}

/**
 * Represents a collection of category groups
 */
export type Groups = Record<string, Group>;

/**
 * Represents an ingredient and its associated metadata
 */
export interface Ingredient {
  id: string;
  /** Name of the ingredient */
  name: string;
  /** Optional description of the ingredient */
  description?: string;
  /** Categories to which the ingredient belongs */
  categories: string[];
  /** Optional source references for the ingredient */
  references?: string[];
  /** Optional synonyms for the ingredient */
  synonyms?: string[];
}

/**
 * Represents a match for an ingredient during analysis
 */
export interface IngredientMatch {
  /** Unique identifier for the match */
  uuid: string;
  /** original text */
  input: string;
  /** Normalized name of the matched ingredient */
  normalized: string;
  /** group that the ingredient belongs to */
  groups: string[];
  /** categories that the ingredient belongs to */
  categories: string[];
  /** flags that the ingredient belongs to */
  flags: string[];
  /** the ingredient matched (if any) */
  ingredient?: Ingredient;
  /** confidence of the match */
  confidence?: number;
}

/**
 * Represents the database of ingredients and categories
 */
export interface IngredientDatabase {
  /** List of all ingredients */
  ingredients: Ingredients;
  /** List of all groups */
  groups: Groups;
  /** Map of all categories by ID */
  categories: Categories;
}

/**
 * Represents additional details about a match
 */
export interface MatchDetails {
  /** Whether the match was successful */
  matched: boolean;
  /** Optional synonym used in the match */
  synonymMatch?: string;
  /** Whether the match was flagged */
  flagged?: boolean;
  /** Confidence of the match */
  confidence?: number;
}

/**
 * Represents optional debug information for a match
 */
export interface DebugInfo {
  /** List of all matches considered */
  allMatches: IngredientMatch[];
}

/**
 * Represents options for performing a match
 */
export interface MatchOptions {
  /** Whether to enable debugging */
  debug?: boolean;
}

/**
 * Represents a normalized and validated list of ingredients
 */
export interface NormalizedIngredientList {
  /** List of cleaned and validated ingredients */
  readonly ingredients: readonly string[];
  /** Whether the ingredient list is valid */
  readonly isValid: boolean;
}

/**
 * Represents a collection of categories
 */
export type Categories = Record<string, Category>;

/**
 * Represents a collection of flags
 */
export type Flags = Record<string, Flag>;

/**
 * Represents a flag
 */
export interface Flag {
  id: string;
  name: string;
  description: string;
}

/**
 * represents a system used to analyze the input
 */
export interface System {
  id: string;
  name: string;
  description?: string;
  settings: string[];
}

/**
 * Represents setting for a system
 */
export interface Setting {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  categories: string[];
  flags: string[];
}

/**
 * Represents a collection of settings
 */
export type Settings = Record<string, Setting>;

/** represents a collection of ingredients   */
export type Ingredients = Record<string, Ingredient>;

/**
 * Add these new types
 */
export type FlagRule = {
  id: string;
  name: string;
  description?: string;
  type: 'ingredient' | 'category' | 'group';
  severity?: 'warning' | 'error';
}

export type UserPreferences = {
  rules: FlagRule[];
  systemId?: string;
}
