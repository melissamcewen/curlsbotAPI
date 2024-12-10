import type { NormalizedIngredientList } from '@/utils/normalizer';

export type { NormalizedIngredientList };

export type { Analyzer } from '@/utils/analyzer';

export interface Ingredient {
  name: string;
  description?: string;
  category: string[];
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

export interface AnalysisResult {
  matches: IngredientMatch[];
  categories: string[];
}

export interface IngredientDatabase {
  ingredients: Ingredient[];
  categories: CategoryGroups;
}

export interface AnalyzerConfig {
  database: IngredientDatabase;
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
  categories: Record<string, Category>;
  matchConfig?: MatchConfig;
}

export type CategoryGroups = Record<string, CategoryGroup>;

export interface MatchOptions {
  debug?: boolean;
}

export interface DebugInfo {
  allMatches: IngredientMatch[];
}

