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
  medium_oils: string[];
  light_oils: string[];
  conditioning_agents: string[];
  emollients: string[];
  anionic_detergents: string[];
  non_water_soluble_waxes: string[];
  water_soluble_waxes: string[];
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
      emollients: ['emollient_alcohols', 'esters'],
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
      non_water_soluble_waxes: ['non_water_soluble_waxes'],
      water_soluble_waxes: ['water_soluble_waxes'],
      medium_oils: ['medium_oils', 'other_oils'],
      light_oils: ['light_oils'],
      conditioning_agents: ['polyquats', 'non_water_soluble_silicones'],
      emollients: ['emollient_alcohols', 'other_emollients', 'esters'],
      anionic_detergents: ['sulfates', 'other_anionic_surfactants'],
    } as LowPorosityCategories,
  };

  // Scoring weights for each category (positive means good, negative means bad)
  const scoring = {
    high: {
      alcohols: -2,
      anionic_detergents: -2,
      heavy_oils: 10,
      medium_oils: 8,
      light_oils: 6,
      emollients: 5,
      mild_surfactants: 4,
      conditioning_agents: 4,
      waxes: 6,
    } as HighPorosityScoring,
    low: {
      heavy_oils: -6.0,
      non_water_soluble_waxes: -7.0,
      water_soluble_waxes: -2.0,
      medium_oils: -5.0,
      light_oils: -3.0,
      conditioning_agents: -0.25,
      emollients: -0.25,
      anionic_detergents: 20,
    } as LowPorosityScoring,
  };

  const totalIngredients = analysis.ingredients.length;

  // Initialize weighted sums for both porosity types
  let highPorosityWeightedSum = 0;
  let lowPorosityWeightedSum = 0;
  let totalHighWeight = 0;
  let totalLowWeight = 0;

  // Analyze each ingredient
  analysis.ingredients.forEach((ingredient, index) => {
    if (ingredient.ingredient?.categories) {
      // Calculate position weight (0.2 to 1.0)
      const percentagePosition = 1 - index / totalIngredients;
      const positionWeight = 0.2 + 0.8 * percentagePosition;



      // Track if ingredient affects each porosity type
      let affectsHigh = false;
      let affectsLow = false;

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
          const score = scoring.high[category] * positionWeight;
          highPorosityWeightedSum += score;
          affectsHigh = true;
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
          const score = scoring.low[category] * positionWeight;
          lowPorosityWeightedSum += score;
          affectsLow = true;
        }
      });

      // If ingredient doesn't affect either porosity type, consider it neutral
      if (!affectsHigh && !affectsLow) {
        // For low porosity, neutral ingredients are good (they're not heavy/oily)
        // For high porosity, neutral ingredients are just okay
        const highNeutralScore = 0.0001;
        const lowNeutralScore = 2.1;

        const highScore = highNeutralScore * positionWeight;
        const lowScore = lowNeutralScore * positionWeight;

        highPorosityWeightedSum += highScore;
        lowPorosityWeightedSum += lowScore;


        // Count neutral ingredients in both totals
        totalHighWeight += positionWeight;
        totalLowWeight += positionWeight;
      } else {
        // Add position weight to totals only if the ingredient affected that porosity type
        if (affectsHigh) totalHighWeight += positionWeight;
        if (affectsLow) totalLowWeight += positionWeight;
      }
    }
  });

  // Helper function to calculate final score
  const calculateScore = (
    weightedSum: number,
    totalWeight: number,
    isLowPorosity: boolean,
  ) => {
    if (totalWeight === 0) return 50;

    const avgScore = weightedSum / totalWeight;


    // Adjust base score and multiplier
    const baseScore = isLowPorosity ? 27 : 0;
    const multiplier = isLowPorosity ? 45 : 25;

    const finalScore = Math.round(baseScore + avgScore * multiplier);

    return finalScore;
  };

  const highScore = calculateScore(
    highPorosityWeightedSum,
    totalHighWeight,
    false,
  );
  const lowScore = calculateScore(lowPorosityWeightedSum, totalLowWeight, true);

  // Ensure scores stay within 0 to 100 range
  return {
    high: Math.min(100, Math.max(0, highScore)),
    low: Math.min(100, Math.max(0, lowScore)),
  };
}
