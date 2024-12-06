import { IngredientAnalysisResult, AnalyzerConfig } from '../types';
export declare class Analyzer {
    private config;
    private matcher;
    constructor(config?: Partial<AnalyzerConfig>);
    analyzeIngredients(ingredientString: string): IngredientAnalysisResult;
    findIngredientsByCategory(category: string): string[];
    getCategoryInfo(categoryName: string): import("../types").Category | undefined;
    getCategoryGroup(categoryName: string): string | undefined;
}
