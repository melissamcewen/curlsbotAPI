/**
 * Represents a normalized ingredient list that has been validated and cleaned
 * @interface NormalizedIngredientList
 */
export interface NormalizedIngredientList {
  /** List of cleaned and validated ingredients */
  readonly ingredients: readonly string[];
  /** Whether the ingredient list is valid */
  readonly isValid: boolean;
}

export type { Analyzer } from '@/utils/analyzer';

export interface Ingredient {
  name: string;
  description?: string;
  category?: string[];
  notes?: string;
  source?: string[];
  synonyms?: string[];
  link?: string[];
  matchConfig?: MatchConfig;
}

export interface MatchConfig {
  matchType?: MatchType[];
  regexes?: string[];
  partials?: string[];
  confidence?: number;
}

export type MatchType = 'fuzzyMatch' | 'partialMatch' | 'regexMatch' | 'exactMatch';

export type MatchSearch = 'ingredient' | 'category' | 'categoryGroup';

export interface MatchDetails {
  matched: boolean;
  matchTypes: MatchType[];
  searchType: MatchSearch;
  confidence?: number;
  matchedOn?: string[];
  synonymMatch?: string;
  flagged?: boolean;
}

export interface IngredientMatch {
  id: string;
  name: string;
  normalized: string;
  details?: Ingredient;
  categories?: string[];
  link?: string;
  matchDetails?: MatchDetails;
  debug?: DebugInfo;
}

/**
 * Result of analyzing an ingredient list
 * @public
 */
export interface AnalysisResult {
  /** Array of matched ingredients */
  matches: IngredientMatch[];
  /** Array of unique categories found */
  categories: string[];
  flags?: {
    ingredients: string[];
    categories: string[];
    categoryGroups: string[];
  };
}

export interface IngredientDatabase {
  ingredients: Ingredient[];
  categories: CategoryGroups;
}

/**
 * Configuration for ingredient database
 * @public
 */
export interface AnalyzerConfig {
  /** Database containing ingredients and categories */
  database: IngredientDatabase;
  options?: AnalyzerOptions;
}

export interface Category {
  name: string;
  description: string;
  tags?: string[];
  notes?: string;
  source?: string[];
  matchConfig?: MatchConfig;
}


export interface CategoryGroup {
  name: string;
  description: string;
  categories: Category[];
  matchConfig?: MatchConfig;
}

export type CategoryGroups = CategoryGroup[];

export interface MatchOptions {
  debug?: boolean;
}

export interface DebugInfo {
  allMatches: IngredientMatch[];
}

export interface AnalyzerOptions {
  flaggedIngredients?: string[];
  flaggedCategories?: string[];
  flaggedCategoryGroups?: string[];
}


