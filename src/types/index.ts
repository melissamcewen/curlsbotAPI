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