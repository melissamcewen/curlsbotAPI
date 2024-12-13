/**
 * Represents configuration options for the analyzer
 */
export interface AnalyzerConfig {
  /** Ingredient database used for analysis */
  database: IngredientDatabase;
  /** Optional analyzer options */
  options?: AnalyzerOptions;
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
  flaggedCategoryGroups?: string[];
}

/**
 * Represents the result of an analysis
 */
export interface AnalysisResult {
  /** List of matching ingredients */
  matches: IngredientMatch[];
  /** List of categories */
  categories: string[];
  /** Optional flags for ingredients, categories, and category groups */
  flags?: {
    /** Ingredients that are flagged */
    ingredients: string[];
    /** Categories that are flagged */
    categories: string[];
    /** Category groups that are flagged */
    categoryGroups: string[];
  };
}

/**
 * Represents a category for ingredients
 */
export interface Category {
  /** Name of the category */
  name: string;
  /** Description of the category */
  description: string;
  /** Optional tags associated with the category */
  tags?: string[];
  /** Optional notes about the category */
  notes?: string;
  /** Optional source references for the category */
  source?: string[];
  /** Unique identifier for the category */
  id: string;
}

/**
 * Represents a group of related categories
 */
export interface CategoryGroup {
  /** Name of the category group */
  name: string;
  /** Description of the category group */
  description: string;
  /** Categories within the group */
  categories: Category[];
  /** Unique identifier for the category group */
  id: string;
}

/**
 * Represents a collection of category groups
 */
export type CategoryGroups = CategoryGroup[];

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
  category: string[];
  /** Optional notes about the ingredient */
  notes?: string;
  /** Optional source references for the ingredient */
  source?: string[];
  /** Optional synonyms for the ingredient */
  synonyms?: string[];
  /** Optional related links for the ingredient */
  link?: string[];
  /** Optional match configuration for the ingredient */
  matchConfig?: MatchConfig;
}

/**
 * Represents a match for an ingredient during analysis
 */
export interface IngredientMatch {
  /** Unique identifier for the match */
  uuid: string;
  /** Name of the matched ingredient */
  name: string;
  /** Normalized name of the matched ingredient */
  normalized: string;
  /** Optional details of the matched ingredient */
  details?: Ingredient;
  /** Optional categories related to the match */
  categories?: string[];
  /** Optional related link for the match */
  link?: string;
  /** Optional additional match details */
  matchDetails?: MatchDetails;
  /** Optional debug information */
  debug?: DebugInfo;
}

/**
 * Represents the database of ingredients and categories
 */
export interface IngredientDatabase {
  /** List of all ingredients */
  ingredients: Ingredient[];
  /** List of all category groups */
  categories: CategoryGroups;
}

/**
 * Represents the configuration for how matches are determined
 */
export interface MatchConfig {
  /** Confidence threshold for matches */
  confidence?: number;
}

/**
 * Represents additional details about a match
 */
export interface MatchDetails {
  /** Whether the match was successful */
  matched: boolean;
  /** Optional matched terms */
  matchedOn?: string[];
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


