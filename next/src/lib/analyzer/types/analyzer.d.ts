import { AnalyzerConfig, IngredientDatabase, AnalysisResult, System } from './types';
export declare class Analyzer {
    private database;
    private system;
    private settings;
    constructor(config?: Partial<AnalyzerConfig>);
    /**
     * Gets the current database being used by the analyzer
     */
    getDatabase(): IngredientDatabase;
    /**
     * Updates the database being used by the analyzer
     */
    setDatabase(database: IngredientDatabase): void;
    /**
     * Gets the current system
     */
    getSystem(): System;
    /**
     * Updates the current system
     */
    setSystem(system: System): void;
    /**
     * Creates an empty analysis result
     */
    private createEmptyResult;
    /**
     * Analyzes a single ingredient against the current system's settings
     */
    private analyzeIngredient;
    /**
     * Analyzes an ingredient list and returns the results
     */
    analyze(ingredientList: string): AnalysisResult;
}
//# sourceMappingURL=analyzer.d.ts.map