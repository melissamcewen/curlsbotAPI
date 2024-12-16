import type { IngredientDatabase, Settings } from '../../src/types';

/**
 * Main test database for unit tests.
 * This database contains a comprehensive set of test ingredients and categories
 * that cover various test scenarios.
 */
export const testDatabase: IngredientDatabase = {
  ingredients: {
    dimethicone: {
      id: 'dimethicone',
      name: 'Dimethicone',
      categories: ['non-water-soluble_silicone'],
      synonyms: ['pdms', 'polydimethylsiloxane'],
      references: ['https://example.com/dimethicone'],
    },
    sodium_laureth_sulfate: {
      id: 'sodium_laureth_sulfate',
      name: 'Sodium Laureth Sulfate',
      categories: ['sulfates'],
      references: ['https://example.com/sles'],
    },
    unknown_water_soluble_silicone: {
      id: 'unknown_water_soluble_silicone',
      name: 'Unknown Water Soluble Silicone',
      categories: ['water-soluble_silicone']
    },
    unknown_non_water_soluble_silicone: {
      id: 'unknown_non-water-soluble_silicone',
      name: 'Unknown Non-water-soluble Silicone',
      categories: ['non-water-soluble_silicone']
    }
  },
  categories: {
    'non-water-soluble_silicone': {
      id: 'non-water-soluble_silicone',
      name: 'Non-water-soluble Silicone',
      description: 'Silicones that are not water soluble',
      group: 'silicones'
    },
    'water-soluble_silicone': {
      id: 'water-soluble_silicone',
      name: 'Water-soluble Silicone',
      description: 'Silicones that are water soluble',
      group: 'silicones',
      inclusions: ['peg']
    },
    'sulfates': {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Sulfate-based cleansers',
      group: 'detergents'
    }
  },
  groups: {
    silicones: {
      id: 'silicones',
      name: 'Silicones',
      inclusions: ['cone', 'silicone'],
      defaultIngredient: 'unknown_non-water-soluble_silicone'
    },
    detergents: {
      id: 'detergents',
      name: 'Detergents'
    }
  }
};

/**
 * Test settings for unit tests.
 */
export const testSettings: Settings = {
  sulfate_free: {
    id: 'sulfate_free',
    name: 'Sulfate Free',
    description: 'Avoid sulfates',
    ingredients: ['sodium_laureth_sulfate'],
    categories: ['sulfates'],
    flags: ['avoid_sulfates'],
  },
  silicone_free: {
    id: 'silicone_free',
    name: 'Silicone Free',
    description: 'Avoid silicones',
    ingredients: ['dimethicone'],
    categories: ['non-water-soluble_silicone'],
    flags: ['avoid_silicones'],
  },
  mild_detergents_only: {
    id: 'mild-detergents-only',
    name: 'Mild Detergents Only',
    description: 'Only allow mild detergents',
    ingredients: [],
    categories: ['mild-detergents'],
    flags: ['avoid_others_in_category'],
  },
};

