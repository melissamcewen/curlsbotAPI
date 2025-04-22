import type { AnalysisResult, PorosityAnalysis } from '../types';
import porosityWeights from '../data/porosity_weights.json';

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

// Define the structure of the weights file
interface PorosityWeights {
  low: {
    [key: string]: number;
  };
}

export function porosity(analysis: AnalysisResult): PorosityAnalysis {
  const definitions: PorosityCategories = {
    alcohols: ['drying_alcohols', 'astringents'],
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

  // Original scoring weights for high porosity calculation
  const scoring: PorosityScoring = {
    alcohols: { high: 0, low: 0 },
    anionic_detergents: { high: 0, low: 20 },
    heavy_oils: { high: 2, low: -6.5 },
    medium_oils: { high: 1, low: -6.5 },
    light_oils: { high: 0, low: -0.5 },
    emollients: { high: 5, low: 0 },
    mild_surfactants: { high: 6, low: 0 },
    conditioning_agents: { high: 22, low: 2 },
    non_water_soluble_waxes: { high: 0, low: -7.0 },
    water_soluble_waxes: { high: 0, low: -2.0 },
    humectants: { high: 2, low: 0.5 },
    film_forming_agents: { high: 7, low: 2 },
  };

  // Specific ingredient scoring for high porosity
  const specificIngredientScoring: SpecificIngredientScoring = {
    amodimethicone: {
      high: 15, // Very good for high porosity
      low: 0, // Decent for low porosity
    },
    // Add more specific ingredients as needed
  };

  // Modified definitions structure for ML low porosity calculation
  // This matches the structure used in training
  const mlDefinitions = {
    alcohols: ['drying_alcohols', 'astringents'],
    anionic_detergents: ['sulfates', 'other_anionic_surfactants'],
    heavy_oils: ['heavy_oils'],
    medium_oils: ['medium_oils'],
    light_oils: ['light_oils'],
    other_oils: ['other_oils'],
    esters: ['esters'],
    other_emollients: ['other_emollients'],
    emollient_alcohols: ['emollient_alcohols'],
    mild_surfactants: ['mild_surfactants'],
    polyquats: ['polyquats'],
    conditioning_agents: ['conditioning_agents'],
    non_water_soluble_waxes: ['non_water_soluble_waxes'],
    water_soluble_waxes: ['water_soluble_waxes'],
    humectants: ['simple_humectants', 'proteins'],
    evaporative_silicones: ['evaporative_silicones'],
    water_soluble_silicones: ['water_soluble_silicones'],
    film_forming_humectants: ['film_forming_humectants'],
    non_water_soluble_silicones: ['non_water_soluble_silicones'],
    film_forming_agents: ['film_forming_agents'],
    petroleum_oils: ['petroleum_oils'],
    amino_acids: ['amino_acids'],
    proteins: ['proteins'],

  };

  const totalIngredients = analysis.ingredients.length;

  // Initialize variables for high porosity calculation (original method)
  let highPorosityWeightedSum = 0;
  let totalHighWeight = 0;

  // Initialize features for low porosity ML calculation
  const features: Record<string, number> = {};

  // Initialize all features to 0
  Object.keys(porosityWeights.low).forEach((feat) => {
    features[feat] = 0;
  });

  // Analyze each ingredient
  analysis.ingredients.forEach((ingredient, index) => {
    // Calculate position weight (0.2 to 1.0)
    const percentagePosition = 1 - index / totalIngredients;
    const positionWeight = 0.3 + 1.0 * Math.exp(-2 * (1 - percentagePosition));

    // HIGH POROSITY CALCULATION (Original Method)
    if (ingredient.ingredient?.categories) {
      // Check for specific ingredient scoring first
      const specificScoring =
        ingredient.ingredient.id in specificIngredientScoring
          ? specificIngredientScoring[ingredient.ingredient.id]
          : undefined;

      if (specificScoring) {
        highPorosityWeightedSum += specificScoring.high * positionWeight;
        totalHighWeight += positionWeight;
      } else {
        // Track if ingredient affects high porosity type
        let affectsHighScoring = false;

        // Check categories for high porosity
        Object.entries(definitions).forEach(
          ([category, categoryIngredients]) => {
            if (
              ingredient.ingredient!.categories.some((cat) =>
                categoryIngredients.includes(cat),
              )
            ) {
              const categoryScoring =
                scoring[category as keyof PorosityCategories];
              highPorosityWeightedSum += categoryScoring.high * positionWeight;
              affectsHighScoring = true;
            }
          },
        );

        // If ingredient doesn't affect scoring, consider it neutral for high porosity
        if (!affectsHighScoring) {
          // For high porosity, neutral ingredients are just okay
          const highNeutralScore = 2.0001;
          highPorosityWeightedSum += highNeutralScore * positionWeight;
        }

        totalHighWeight += positionWeight;
      }
    } else if (ingredient.ingredient) {
      // Handle unknown ingredients for high porosity
      const highUnknownScore = 2.0001;
      highPorosityWeightedSum += highUnknownScore * positionWeight;
      totalHighWeight += positionWeight;
    }

    // LOW POROSITY CALCULATION (ML Method)
    const ingredientId = ingredient.ingredient?.id;
    if (!ingredientId) return;

    // Handle "unknown" specially
    if (ingredientId === 'unknown') {
      features['unknown'] = (features['unknown'] || 0) + positionWeight;
      return;
    }

    // Handle special ingredients
    if (ingredientId === 'amodimethicone') {
      features['amodimethicone'] =
        (features['amodimethicone'] || 0) + positionWeight;
      return;
    }

    // Handle categories
    const categories = ingredient.ingredient?.categories;
    if (!categories || categories.length === 0) return;

    let matched = false;

    // Match categories exactly as in Python training
    Object.entries(mlDefinitions).forEach(([feature, categoryList]) => {
      if (categories.some((cat) => categoryList.includes(cat))) {
        features[feature] = (features[feature] || 0) + positionWeight;
        matched = true;
      }
    });

    // If no matches, count as neutral
    if (!matched) {
      features['neutral'] = (features['neutral'] || 0) + positionWeight;
    }
  });

  // Calculate high porosity score (original method)
  const calculateHighScore = (weightedSum: number, totalWeight: number) => {
    if (totalWeight === 0) return 50;

    const avgScore = weightedSum / totalWeight;
    const baseScore = 0;
    const multiplier = 25;
    const finalScore = Math.round(baseScore + avgScore * multiplier);

    return finalScore;
  };

  const highScore = calculateHighScore(
    highPorosityWeightedSum,
    totalHighWeight,
  );

  // Calculate low porosity score (ML method)
  const lowWeights = porosityWeights.low;
  let lowRawScore = 0;

  Object.keys(features).forEach((feat) => {
    if (feat in lowWeights) {
      lowRawScore +=
        (features[feat] || 0) * lowWeights[feat as keyof typeof lowWeights];
    }
  });

  // Apply sigmoid function to get probability
  const lowProb = 1 / (1 + Math.exp(-lowRawScore));

  // Scale to 0-100
  const lowScore = Math.round(lowProb * 100);

  // Ensure scores stay within 0 to 100 range
  return {
    high: Math.min(100, Math.max(0, highScore)),
    low: Math.min(100, Math.max(0, lowScore)),
  };
}
