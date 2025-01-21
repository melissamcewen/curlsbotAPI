import type { AnalysisResult } from '../types';



export function porosity(analysis: AnalysisResult): PorosityAnalysis {
  const definitions = {
    high: {
      bad: [
        'drying_alcohols',
        'sulfates',
        'other_anionic_surfactants',
        'astringents',
      ],
      good: [
        'emollient_alcohols',
        'water_soluble_silicones',
        'non_water_soluble_silicones',
        'other_oils',
        'mild_surfactants',
        'heavy_oils',
        'light_oils',
        'medium_oils',
        'water_soluble_waxes',
        'evaporative_silicones',
        'polyquats',
        'film_forming_humectants',
        'simple_humectants',
        'proteins',
        'other_emollients',
        'conditioning_agents',
        'film_forming_agents',
      ],
    },
    low: {
      bad: ['heavy_oils', 'non_water_soluble_waxes', 'water_soluble_waxes'],
      medium: ['other_oils', 'light_oils', 'medium_oils', 'other_emollients'],
      good: ['sulfates', 'other_anionic_surfactants'],
    },
  };

  let highScore = 50;
  let lowScore = 90;

  // Analyze each ingredient
  analysis.ingredients.forEach((ingredient, index) => {
    if (ingredient.ingredient) {
      // Calculate position weight (earlier ingredients have more weight)
      const positionWeight = 1 / (1 + index * 0.5);

      // Check categories for high porosity
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.high.bad.includes(cat),
        )
      ) {
        highScore -= 10 * positionWeight;
      }
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.high.good.includes(cat),
        )
      ) {
        highScore += 20 * positionWeight;
      }

      // Check categories for low porosity
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.low.bad.includes(cat),
        )
      ) {
        lowScore -= 15 * positionWeight;
      }
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.low.medium.includes(cat),
        )
      ) {
        lowScore -= 5 * positionWeight;
      }
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.low.good.includes(cat),
        )
      ) {
        lowScore += 3 * positionWeight;
      }
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
