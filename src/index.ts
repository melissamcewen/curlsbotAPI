import type {
  // Core types
  AnalyzerConfig,
  AnalysisResult,

  // Ingredient types
  Ingredient,
  IngredientMatch,
  IngredientDatabase,

  // Category types
  Category,
  CategoryGroup,
  CategoryGroups,

  // Match types
  MatchType,
  MatchSearch,
  MatchConfig,
  MatchDetails,
  MatchOptions,

  // Debug types
  DebugInfo,

  // Normalizer types
  NormalizedIngredientList,
} from './types';

export type {
  AnalyzerConfig,
  AnalysisResult,
  Ingredient,
  IngredientMatch,
  IngredientDatabase,
  Category,
  CategoryGroup,
  CategoryGroups,
  MatchType,
  MatchSearch,
  MatchConfig,
  MatchDetails,
  MatchOptions,
  DebugInfo,
  NormalizedIngredientList,
};

export { Analyzer } from './utils/analyzer';
export {
  matchIngredient,
  createIndexedDatabase,
  createCategoryIndex
} from './utils/matcher';
export { normalizer } from './utils/normalizer';
export { initializeDatabase } from './utils/initialize';
