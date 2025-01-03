import type { AnalysisResult } from "types";

import type { PEHAnalysis } from "types";

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
