import type { AnalysisResult, PorosityAnalysis } from '../types';
import porosityCategoryWeights from '../data/porosity_weights.json';

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

// Special ingredients that need custom penalties for low porosity
interface SpecialLowPorosityIngredients {
  [key: string]: number; // ingredient ID -> penalty multiplier
}

// Ingredients that automatically disqualify a product for low porosity hair
// These are extremely problematic ingredients that make a product unsuitable for low porosity hair
const automaticLowPorosityDisqualifiers = new Set([
  'petrolatum',
  'lanolin',
  'lanolin_oil',
  // Add other automatic disqualifiers as needed
]);

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
      low: 0, // This low value is ignored in ML calculation
    },
    // Add more specific ingredients as needed
  };

  // Special ingredients that need custom handling for low porosity
  // These are problematic ingredients that deserve higher penalties
  // Higher values = more problematic for low porosity
  const specialLowPorosityIngredients: SpecialLowPorosityIngredients = {
    petrolatum: 40, // Extremely occlusive, very problematic for low porosity
    lanolin: 35, // Very occlusive, highly problematic for low porosity
    lanolin_oil: 35, // Very occlusive, highly problematic for low porosity
  };

  const totalIngredients = analysis.ingredients.length;

  // Check if any automatic disqualifiers are present in the ingredients list
  let hasAutomaticDisqualifier = false;
  for (const ingredient of analysis.ingredients) {
    if (!ingredient.ingredient) continue;

    if (automaticLowPorosityDisqualifiers.has(ingredient.ingredient.id)) {
      hasAutomaticDisqualifier = true;
      break;
    }
  }

  // Get max number of ingredients to consider for low porosity from metadata
  const maxLowPorosityIngredients =
    porosityCategoryWeights.metadata?.effective_ingredients || 5;

  // Initialize variables for high porosity calculation (original method)
  let highPorosityWeightedSum = 0;
  let totalHighWeight = 0;

  // Initialize for low porosity calculation
  let lowPorosityScore = 100; // Start with perfect score
  let lowPorosityPenaltySum = 0;

  // Track bad ingredients and categories for simple products
  const badIngredientsHit = new Set<string>();
  const badCategoriesHit = new Set<string>();

  // Apply penalty for products with very few ingredients
  const applyIngredientDiversityPenalty = () => {
    // If product has very few ingredients, apply an additional penalty
    if (totalIngredients <= 3) {
      // The fewer the ingredients, the higher the penalty
      const fewIngredientsPenalty = Math.max(0, 20 - totalIngredients * 5);
      lowPorosityPenaltySum += fewIngredientsPenalty;

      // If product has few ingredients AND contains bad ingredients, penalty is higher
      if (badIngredientsHit.size > 0 || badCategoriesHit.size > 0) {
        // Stronger penalty if the few ingredients include bad ones
        const badIngredientRatio =
          (badIngredientsHit.size + badCategoriesHit.size) / totalIngredients;
        const concentratedBadnessPenalty = badIngredientRatio * 20;
        lowPorosityPenaltySum += concentratedBadnessPenalty;
      }
    }

    // For products that are mostly a single bad ingredient (like "coconut oil")
    // apply an extreme penalty
    if (
      totalIngredients === 1 &&
      (badIngredientsHit.size > 0 || badCategoriesHit.size > 0)
    ) {
      lowPorosityPenaltySum += 50; // Very strong penalty for single-ingredient bad products
    }
  };

  // Create filtered list of ingredients for low porosity analysis
  // This handles duplicate ingredients and removes completely unknown ingredients
  const filteredIngredientsForLowPorosity = [];
  const seenIngredientIds = new Set<string>();
  const skipIds = new Set(['unknown', 'water', 'aqua', 'eau']);

  for (const ingredient of analysis.ingredients) {
    if (!ingredient.ingredient) continue;

    const id = ingredient.ingredient.id;

    // Skip completely unknown ingredients (but not ones like unknown_butter)
    if (id === 'unknown') continue;

    // Check for duplicate ingredients or common duplicates like water/aqua
    if (skipIds.has(id) && seenIngredientIds.has('water')) continue;

    // For water/aqua/eau, standardize to 'water'
    const normalizedId = skipIds.has(id) ? 'water' : id;

    // Skip if we've seen this ingredient before
    if (seenIngredientIds.has(normalizedId)) continue;

    // Add to filtered list and mark as seen
    seenIngredientIds.add(normalizedId);
    filteredIngredientsForLowPorosity.push({
      ingredient: ingredient.ingredient,
      originalIndex: filteredIngredientsForLowPorosity.length,
    });

    // Once we have enough effective ingredients, stop
    if (filteredIngredientsForLowPorosity.length >= maxLowPorosityIngredients)
      break;
  }

  // Analyze each ingredient for HIGH POROSITY (using all ingredients)
  analysis.ingredients.forEach((ingredient, index) => {
    // Skip if no ingredient data
    if (!ingredient.ingredient) return;

    // For high porosity, calculate position weight using exponential decay
    const percentagePosition = 1 - index / totalIngredients;
    const highPorosityPositionWeight =
      0.3 + Math.exp(-2 * (1 - percentagePosition));

    // HIGH POROSITY CALCULATION (Original Method - Unchanged)
    if (ingredient.ingredient.categories) {
      // Check for specific ingredient scoring first
      const specificScoring =
        ingredient.ingredient.id in specificIngredientScoring
          ? specificIngredientScoring[ingredient.ingredient.id]
          : undefined;

      if (specificScoring) {
        highPorosityWeightedSum +=
          specificScoring.high * highPorosityPositionWeight;
        totalHighWeight += highPorosityPositionWeight;
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
              highPorosityWeightedSum +=
                categoryScoring.high * highPorosityPositionWeight;
              affectsHighScoring = true;
            }
          },
        );

        // If ingredient doesn't affect scoring, consider it neutral for high porosity
        if (!affectsHighScoring) {
          // For high porosity, neutral ingredients are just okay
          const highNeutralScore = 2.0001;
          highPorosityWeightedSum +=
            highNeutralScore * highPorosityPositionWeight;
        }

        totalHighWeight += highPorosityPositionWeight;
      }
    } else if (ingredient.ingredient) {
      // Handle unknown ingredients for high porosity
      const highUnknownScore = 2.0001;
      highPorosityWeightedSum += highUnknownScore * highPorosityPositionWeight;
      totalHighWeight += highPorosityPositionWeight;
    }
  });

  // Skip low porosity analysis if automatic disqualifier is found
  if (!hasAutomaticDisqualifier) {

    // Analyze filtered ingredients for LOW POROSITY
    filteredIngredientsForLowPorosity.forEach(
      ({ ingredient, originalIndex }, index) => {
        const ingredientId = ingredient.id;

        // Special exceptions handling (petrolatum, lanolin, etc.)
        if (
          ingredientId in specialLowPorosityIngredients &&
          typeof specialLowPorosityIngredients[ingredientId] === 'number'
        ) {
          const penaltyMultiplier = specialLowPorosityIngredients[ingredientId];
          // Apply full penalty for special ingredients
          const penalty = penaltyMultiplier;
          lowPorosityPenaltySum += penalty;
          badIngredientsHit.add(ingredientId);
          return;
        }

        // Check if ingredient is in the bad_ingredients list from ML model
        if (
          porosityCategoryWeights.bad_ingredients &&
          Object.prototype.hasOwnProperty.call(
            porosityCategoryWeights.bad_ingredients,
            ingredientId,
          )
        ) {
          // Get the ML-derived severity
          const severity =
            porosityCategoryWeights.bad_ingredients[
              ingredientId as keyof typeof porosityCategoryWeights.bad_ingredients
            ];

          // Position factor - first ingredient has the most impact, decreasing linearly
          /* removing this for now
          const positionFactor = 1 - (index / maxLowPorosityIngredients) * 0.5; // 1.0 to 0.5 based on position
          */

          // Apply penalty based on severity and position
          //const penalty = severity * 50 * positionFactor;
          const penalty = severity * 50;
          lowPorosityPenaltySum += penalty;
          badIngredientsHit.add(ingredientId);
          return;
        }

        // Check ingredient categories against bad categories
        const categories = ingredient.categories || [];
        if (categories.length > 0) {
          for (const cat of categories) {
            if (
              porosityCategoryWeights.bad_categories &&
              Object.prototype.hasOwnProperty.call(
                porosityCategoryWeights.bad_categories,
                cat,
              )
            ) {
              // Get the ML-derived severity for this category
              const severity =
                porosityCategoryWeights.bad_categories[
                  cat as keyof typeof porosityCategoryWeights.bad_categories
                ];

              // Position factor - first ingredient has the most impact, decreasing linearly
             /* const positionFactor =
                1 - (index / maxLowPorosityIngredients) * 0.5; // 1.0 to 0.5 based on position
              */

              // Apply penalty based on severity and position
             // const penalty = severity * 40 * positionFactor;
              const penalty = severity * 40;
              lowPorosityPenaltySum += penalty;
              badCategoriesHit.add(cat);
            }
          }
        }
      },
    );

    // Apply the ingredient diversity penalty for simple products
    applyIngredientDiversityPenalty();
  }

  // Calculate high porosity score (original method)
  const calculateHighScore = (weightedSum: number, totalWeight: number) => {
    if (totalWeight === 0) return 50;

    const avgScore = weightedSum / totalWeight;
    const baseScore = 0;
    const multiplier = 25;
    const finalScore = Math.round(baseScore + avgScore * multiplier);

    return finalScore;
  };

  // Calculate final scores
  const highScore = calculateHighScore(
    highPorosityWeightedSum,
    totalHighWeight,
  );

  // For low porosity, apply the total penalty to the perfect score or set to 0 if disqualified
  const lowScore = hasAutomaticDisqualifier
    ? 0
    : Math.round(Math.max(0, lowPorosityScore - lowPorosityPenaltySum));

  // Ensure scores stay within 0 to 100 range
  return {
    high: Math.min(100, Math.max(0, highScore)),
    low: Math.min(100, Math.max(0, lowScore)),
  };
}
