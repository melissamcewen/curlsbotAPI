import { CategoryGroups } from './category';
export interface Ingredient {
    name: string;
    description: string;
    category: string[];
    notes?: string;
    source?: string[];
    synonyms?: string[];
}
export interface IngredientMatch {
    name: string;
    normalized: string;
    matched: boolean;
    details?: Ingredient;
    categories?: string[];
    fuzzyMatch?: boolean;
    confidence?: number;
    matchedSynonym?: string;
}
export interface AnalysisResult {
    matches: IngredientMatch[];
    categories: string[];
}
export type IngredientAnalysisResult = AnalysisResult;
export interface IngredientDatabase {
    ingredients: Record<string, Ingredient>;
    categories: CategoryGroups;
}
export interface AnalyzerConfig {
    database: IngredientDatabase;
    fuzzyMatchThreshold?: number;
}
export * from './category';
