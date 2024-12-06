import { IngredientMatch, AnalyzerConfig } from '../types';
export declare function createMatcher(config: AnalyzerConfig): (ingredientName: string) => IngredientMatch;
