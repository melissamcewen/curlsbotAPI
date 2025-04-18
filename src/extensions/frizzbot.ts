import type { AnalysisResult, FrizzbotAnalysis } from '../types';

export function frizzbot(analysis: AnalysisResult): FrizzbotAnalysis {
  const definitions = {
    emollients: {
      groups: ['silicones', 'waxes'],
      categories: ['emollient_alcohols', 'polyquats', 'conditioning_agents', 'film_forming_agents', 'light_oils', 'medium_oils', 'heavy_oils', 'fatty_acids'],
    },
    film_forming_humectants: {
      groups: [],
      categories: ['film_forming_humectants', 'proteins', 'amino_acids'],
    },
    simple_humectants: {
      groups: [],
      categories: ['simple_humectants'],
    },
  };

  // Initialize arrays to store ingredients of each type with their positions
  const simple_humectants: string[] = [];
  const film_forming_humectants: string[] = [];
  const emollients: string[] = [];

  // Track weighted scores based on position
  let weighted_simple_score = 0;
  let weighted_film_score = 0;
  let weighted_emollient_score = 0;

  // Analyze each ingredient
  analysis.ingredients.forEach((ingredient, index) => {
    if (ingredient.ingredient) {
      // Calculate position weight (earlier ingredients have more weight)
      // We use a decay function that gives more weight to earlier ingredients
      const positionWeight = 1 / (1 + index * 0.5);

      // Check for emollients
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.emollients.categories.includes(cat),
        ) ||
        (ingredient.ingredient.group &&
          definitions.emollients.groups.includes(ingredient.ingredient.group))
      ) {
        emollients.push(ingredient.ingredient.name);
        weighted_emollient_score += positionWeight;
      }

      // Check for film forming humectants
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.film_forming_humectants.categories.includes(cat),
        )
      ) {
        film_forming_humectants.push(ingredient.ingredient.name);
        weighted_film_score += positionWeight;
      }

      // Check for simple humectants
      if (
        ingredient.ingredient.categories.some((cat) =>
          definitions.simple_humectants.categories.includes(cat),
        )
      ) {
        simple_humectants.push(ingredient.ingredient.name);
        weighted_simple_score += positionWeight;
      }
    }
  });

  // Calculate numbers (for reporting)
  const simple_humectants_number = simple_humectants.length;
  const film_forming_humectants_number = film_forming_humectants.length;
  const emollients_number = emollients.length;

  // Calculate base score using weighted values
  // Simple humectants increase frizz (+1 each)
  // Film forming humectants help a lot (-3 each)
  // Emollients help somewhat (-1.5 each)
  const baseScore =
    weighted_simple_score * 1 +
    weighted_film_score * -4 +
    weighted_emollient_score * -2;

  // Calculate total weighted ingredients that affect frizz
  const totalWeightedIngredients =
    weighted_simple_score + weighted_film_score + weighted_emollient_score;

  // If there are no frizz-affecting ingredients, return 0
  if (totalWeightedIngredients === 0) {
    return {
      simple_humectants_number,
      film_forming_humectants_number,
      emollients_number,
      simple_humectants,
      film_forming_humectants,
      emollients,
      score: 0,
    };
  }

  // Normalize the score to a -100 to 100 range
  // We use a sigmoid-like function to ensure the score stays within bounds
  // and scales naturally with the number of ingredients
  const normalizedScore = Math.round(
    100 * Math.tanh(baseScore / (totalWeightedIngredients * 2)),
  );

  return {
    simple_humectants_number,
    film_forming_humectants_number,
    emollients_number,
    simple_humectants,
    film_forming_humectants,
    emollients,
    score: normalizedScore,
  };
}
