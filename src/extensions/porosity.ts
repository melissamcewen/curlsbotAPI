import type { AnalysisResult, PorosityAnalysis } from '../types';

type PorosityCategories = {
  alcohols: string[];
  anionic_detergents: string[];
  heavy_oils: string[];
  medium_oils: string[];
  light_oils: string[];
  emollients: string[];
  mild_surfactants: string[];
  conditioning_agents: string[];
  non_water_soluble_waxes: string[];
  water_soluble_waxes: string[];
  humectants: string[];
  film_forming_agents: string[];
};

// Add specific ingredient scoring
type SpecificIngredientScoring = {
  [key: string]: {
    high: number;
    low: number;
  };
};

type PorosityScoring = {
  [K in keyof PorosityCategories]: {
    high: number;
    low: number;
  };
};

export function porosity(analysis: AnalysisResult): PorosityAnalysis {
  const definitions: PorosityCategories = {
    alcohols: ['volatile_alcohols', 'astringents'],
    anionic_detergents: ['sulfates', 'other_anionic_surfactants'],
    heavy_oils: ['heavy_oils'],
    medium_oils: ['medium_oils', 'other_oils'],
    light_oils: ['light_oils'],
    emollients: ['emollient_alcohols', 'esters', 'other_emollients'],
    mild_surfactants: ['mild_surfactants'],
    conditioning_agents: ['conditioning_agents', 'polyquats'],
    non_water_soluble_waxes: ['non_water_soluble_waxes'],
    water_soluble_waxes: ['water_soluble_waxes'],
    humectants: ['simple_humectants', 'proteins'],
    film_forming_agents: [
      'film_forming_agents',
      'evaporative_silicones',
      'water_soluble_silicones',
      'non_water_soluble_silicones',
      'film_forming_humectants',
    ],
  };

  // Scoring weights for each category
  const scoring: PorosityScoring = {
    alcohols: { high: 0, low: 0 },
    anionic_detergents: { high: 0, low: 20 },
    heavy_oils: { high: 2, low: -8 },
    medium_oils: { high: 1, low: -7.8 },
    light_oils: { high: 0, low: -0.5 },
    emollients: { high: 5, low: 0 },
    mild_surfactants: { high: 6, low: 0 },
    conditioning_agents: { high: 22, low: 2 },
    non_water_soluble_waxes: { high: 0, low: -7.0 },
    water_soluble_waxes: { high: 0, low: -2.0 },
    humectants: { high: 2, low: 0 },
    film_forming_agents: { high: 7, low: 2 },
  };

  // Add specific ingredient scoring
  const specificIngredientScoring: SpecificIngredientScoring = {
    amodimethicone: {
      high: 15, // Very good for high porosity
      low: 0, // Decent for low porosity
    },
    // Add more specific ingredients as needed
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

      // Check for specific ingredient scoring first
      const specificScoring =
        specificIngredientScoring[ingredient.ingredient.id];
      if (specificScoring) {
        highPorosityWeightedSum += specificScoring.high * positionWeight;
        lowPorosityWeightedSum += specificScoring.low * positionWeight;
        totalHighWeight += positionWeight;
        totalLowWeight += positionWeight;
        return; // Skip category-based scoring for this ingredient
      }

      // Track if ingredient affects either porosity type
      let affectsScoring = false;

      // Check categories for both porosity types
      Object.entries(definitions).forEach(([category, categoryIngredients]) => {
        if (
          ingredient.ingredient!.categories.some((cat) =>
            categoryIngredients.includes(cat),
          )
        ) {
          const categoryScoring = scoring[category as keyof PorosityCategories];
          highPorosityWeightedSum += categoryScoring.high * positionWeight;
          lowPorosityWeightedSum += categoryScoring.low * positionWeight;
          affectsScoring = true;
        }
      });

      // If ingredient doesn't affect scoring, consider it neutral
      if (!affectsScoring) {
        // For low porosity, neutral ingredients are good (they're not heavy/oily)
        // For high porosity, neutral ingredients are just okay
        const highNeutralScore = 2.0001;
        const lowNeutralScore = 2.6;

        highPorosityWeightedSum += highNeutralScore * positionWeight;
        lowPorosityWeightedSum += lowNeutralScore * positionWeight;
        totalHighWeight += positionWeight;
        totalLowWeight += positionWeight;
      } else {
        totalHighWeight += positionWeight;
        totalLowWeight += positionWeight;
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
    const multiplier = isLowPorosity ? 46 : 25;

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
