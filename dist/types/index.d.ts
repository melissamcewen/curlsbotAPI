export interface Ingredient {
    name: string;
    description: string;
    category: string[];
    notes?: string;
    source?: string[];
}
export interface IngredientMatch {
    name: string;
    normalized: string;
    matched: boolean;
    details?: Ingredient;
    categories?: string[];
}
export type IngredientAnalysisResult = IngredientMatch[];
