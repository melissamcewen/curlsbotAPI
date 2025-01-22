import type { AnalysisResult, PorosityAnalysis } from '../types';

type HighPorosityCategories = {
  alcohols: string[];
  anionic_detergents: string[];
  emollients: string[];
  mild_surfactants: string[];
  conditioning_agents: string[];
  waxes: string[];
};

type LowPorosityCategories = {
  heavy_oils: string[];
  waxes: string[];
  medium_oils: string[];
  light_oils: string[];
  conditioning_agents: string[];
  other_emollients: string[];
  anionic_detergents: string[];
};

type HighPorosityScoring = {
  [K in keyof HighPorosityCategories]: number;
};

type LowPorosityScoring = {
  [K in keyof LowPorosityCategories]: number;
};

export function porosity(analysis: AnalysisResult): PorosityAnalysis {
  const definitions = {
    high: {
      //not as good for high porosity
      alcohols: ['drying_alcohols', 'astringents'],
      anionic_detergents: ['sulfates', 'other_anionic_surfactants'],
      //good for high porosity
      heavy_oils: ['heavy_oils'],
      medium_oils: ['medium_oils', 'other_oils'],
      light_oils: ['light_oils'],
      emollients: [
        'emollient_alcohols',
      ],
      mild_surfactants: ['mild_surfactants'],
      conditioning_agents: [
        'conditioning_agents',
        'polyquats',
        'film_forming_agents',
        'evaporative_silicones',
        'water_soluble_silicones',
        'non_water_soluble_silicones',
        'film_forming_humectants',
        'simple_humectants',
        'proteins',
      ],
      waxes: ['non_water_soluble_waxes', 'water_soluble_waxes'],
    } as HighPorosityCategories,
    low: {
      heavy_oils: ['heavy_oils'],
      waxes: ['non_water_soluble_waxes', 'water_soluble_waxes'],
      medium_oils: ['medium_oils', 'other_oils'],
      light_oils: ['light_oils'],
      conditioning_agents: [
        'polyquats',
        'non_water_soluble_silicones'
      ],
      other_emollients: ['other_emollients', 'emollient_alcohols'],
      anionic_detergents: ['sulfates', 'other_anionic_surfactants'],
    } as LowPorosityCategories,
  };

  const scoring = {
    high: {
      alcohols: -10,
      anionic_detergents: -10,
      heavy_oils: 10,
      medium_oils: 8,
      light_oils: 2,
      emollients: 6,
      mild_surfactants: 10,
      conditioning_agents: 6,
      waxes: 10,
    } as HighPorosityScoring,
    low: {
      heavy_oils: -10,
      waxes: -30,
      medium_oils: -8,
      light_oils: -5,
      conditioning_agents: -4,
      other_emollients: -4,
      anionic_detergents: 10,
    } as LowPorosityScoring,
  };

  let highScore = 50;
  let lowScore = 90;

  const totalIngredients = analysis.ingredients.length;

  // Analyze each ingredient
  analysis.ingredients.forEach((ingredient, index) => {
    if (ingredient.ingredient?.categories) {
      // Calculate position weight based on percentage position (0 to 1)
      // First ingredient = 1.0, Last ingredient = 0.2
      const percentagePosition = 1 - index / totalIngredients;
      const positionWeight = 0.2 + 0.8 * percentagePosition;

      // Check categories for high porosity
      (
        Object.entries(definitions.high) as [
          keyof HighPorosityCategories,
          string[],
        ][]
      ).forEach(([category, categoryIngredients]) => {
        if (
          ingredient.ingredient!.categories.some((cat) =>
            categoryIngredients.includes(cat),
          )
        ) {
          highScore += scoring.high[category] * positionWeight;
        }
      });

      // Check categories for low porosity
      (
        Object.entries(definitions.low) as [
          keyof LowPorosityCategories,
          string[],
        ][]
      ).forEach(([category, categoryIngredients]) => {
        if (
          ingredient.ingredient!.categories.some((cat) =>
            categoryIngredients.includes(cat),
          )
        ) {
          lowScore += scoring.low[category] * positionWeight;
        }
      });
    }
  });

  // Ensure scores stay within -100 to 100 range
  highScore = Math.min(100, Math.max(-100, Math.round(highScore)));
  lowScore = Math.min(100, Math.max(-100, Math.round(lowScore)));

  return {
    high: highScore,
    low: lowScore,
  };
}
