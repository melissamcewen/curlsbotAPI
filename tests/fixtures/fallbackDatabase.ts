import type { IngredientDatabase } from '../../src/types';

export const mockMainDatabase: IngredientDatabase = {
  ingredients: {
    'jojoba_oil': {
      id: 'jojoba_oil',
      name: 'Jojoba Oil',
      categories: ['light_oils'],
      synonyms: ['simmondsia chinensis seed oil']
    }
  },
  categories: {
    'light_oils': {
      id: 'light_oils',
      name: 'Light Oils',
      description: 'Light oils that are good for hair',
      group: 'oils'
    }
  },
  groups: {
    'oils': {
      id: 'oils',
      name: 'Oils'
    }
  }
};

export const mockFallbackDatabase: IngredientDatabase = {
  ingredients: {
    'unknown_non_water_soluble_silicones': {
      id: 'unknown_non_water_soluble_silicones',
      name: 'Unknown Non-Water Soluble Silicones',
      categories: ['non-water-soluble_silicones'],
      synonyms: [
        'cone',
        'dimethicon',
        'silane',
        'siloxane',
        'dimethcione',
        'botanisil',
        'silicon',
        'silylate',
        'silsesquioxane',
        'siloxysilicate',
        'microsil'
      ]
    },
    'unknown_water_soluble_silicones': {
      id: 'unknown_water_soluble_silicones',
      name: 'Unknown Water Soluble Silicones',
      categories: ['water-soluble_silicones'],
      synonyms: ['peg', 'ppg', 'pg-']
    },
    'unknown_sulfates': {
      id: 'unknown_sulfates',
      name: 'Unknown Sulfates',
      categories: ['sulfates'],
      synonyms: ['sulfate', 'sulphate']
    }
  },
  categories: {
    'non-water-soluble_silicones': {
      id: 'non-water-soluble_silicones',
      name: 'Non-Water Soluble Silicones',
      description: 'Silicones that are not water soluble',
      group: 'silicones'
    },
    'water-soluble_silicones': {
      id: 'water-soluble_silicones',
      name: 'Water Soluble Silicones',
      description: 'Silicones that are water soluble',
      group: 'silicones'
    },
    'sulfates': {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Strong cleansing agents',
      group: 'detergents'
    }
  },
  groups: {
    'silicones': {
      id: 'silicones',
      name: 'Silicones'
    },
    'detergents': {
      id: 'detergents',
      name: 'Detergents'
    }
  }
};
