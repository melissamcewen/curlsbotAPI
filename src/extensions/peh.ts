import type { AnalysisResult } from "types";

/**
 * A PEH Analysis
 */
export interface PEHAnalysis {
  //number of proteins
  proteins: number;
  //number of emollients
  emollients: number;
  //number of humectants
  humectants: number;
  //protein score
  proteinScore: number;
  //emollient score
  emollientScore: number;
  //humectant score
  humectantScore: number;
}

/// takes a AnalysisResult and returns a PEHAnalysis
export function peh(analysis: AnalysisResult): PEHAnalysis {
  const definitions = {
    proteins: {
      groups: [],
      categories: ["proteins"]
    },
    emollients: {
      groups: ["silicones", "oils"],
      categories: ["emollient_alcohols"]
    },
    humectants: {
      groups: [],
      categories: ["film_forming_humectants", "simple_humectants"]
    }
  }

  return {
    proteins: 0,
    emollients: 0,
    humectants: 0,
    proteinScore: 0,
    emollientScore: 0,
    humectantScore: 0,
  };
}
