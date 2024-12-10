export { Analyzer } from './utils/analyzer';
export { matchIngredient } from './utils/matcher';
export { normalizer } from './utils/normalizer';

export type {
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
