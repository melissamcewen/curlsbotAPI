import type { IngredientDatabase, Settings, System } from '../../src/types';

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
      categories: ['non_water_soluble_silicone'],
      synonyms: ['pdms', 'polydimethylsiloxane'],
      references: ['https://example.com/dimethicone'],
    },
    sodium_laureth_sulfate: {
      id: 'sodium_laureth_sulfate',
      name: 'Sodium Laureth Sulfate',
      categories: ['sulfates', 'surfactants'],
      references: ['https://example.com/sles'],
    },
    unknown_water_soluble_silicone: {
      id: 'unknown_water_soluble_silicone',
      name: 'Unknown Water Soluble Silicone',
      categories: ['water_soluble_silicone'],
    },
    unknown_non_water_soluble_silicone: {
      id: 'unknown_non_water_soluble_silicone',
      name: 'Unknown Non-water-soluble Silicone',
      categories: ['non_water_soluble_silicone'],
    },
    cetyl_alcohol: {
      id: 'cetyl_alcohol',
      name: 'Cetyl Alcohol',
      categories: ['emollient_alcohols'],
      synonyms: ['hexadecan-1-ol', 'hexadecan', 'palmityl alcohol'],
    },
    sd_alcohol: {
      id: 'sd_alcohol',
      name: 'SD Alcohol',
      categories: ['drying_alcohols'],
    },
    sodium_cocoyl_isethionate: {
      id: 'sodium_cocoyl_isethionate',
      name: 'Sodium Cocoyl Isethionate',
      categories: ['mild_detergents'],
    },
  },
  categories: {
    'non_water_soluble_silicone': {
      id: 'non_water_soluble_silicone',
      name: 'Non-water-soluble Silicone',
      description: 'Silicones that are not water soluble',
      group: 'silicones',
    },
    'water_soluble_silicone': {
      id: 'water_soluble_silicone',
      name: 'Water-soluble Silicone',
      description: 'Silicones that are water soluble',
      group: 'silicones',
      inclusions: ['peg'],
      defaultIngredient: 'unknown_water_soluble_silicone',
    },
    sulfates: {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Sulfate-based cleansers',
      group: 'detergents',
    },
    surfactants: {
      id: 'surfactants',
      name: 'Surfactants',
      description: 'Surface active agents',
      group: 'detergents',
    },
    emollient_alcohols: {
      id: 'emollient_alcohols',
      name: 'Emollient Alcohols',
      description: 'Moisturizing alcohols',
      group: 'alcohols',
    },
    drying_alcohols: {
      id: 'drying_alcohols',
      name: 'Drying Alcohols',
      description: 'Drying alcohols',
      group: 'alcohols',
    },
    mild_detergents: {
      id: 'mild_detergents',
      name: 'Mild Detergents',
      description: 'Gentle cleansing agents',
      group: 'detergents',
    },
  },
  groups: {
    silicones: {
      id: 'silicones',
      name: 'Silicones',
      inclusions: ['cone', 'silicone'],
      defaultIngredient: 'unknown_non_water_soluble_silicone',
    },
    detergents: {
      id: 'detergents',
      name: 'Detergents',
    },
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
    },
  },
};

/**
 * Test settings for unit tests.
 */
export const testSettings: Settings = {
  sulfate_free: {
    id: 'sulfate_free',
    name: 'Sulfate Free',
    description: 'Avoid sulfates',
    categories: ['sulfates'],
    defaultStatus: 'warning'
  },
  silicone_free: {
    id: 'silicone_free',
    name: 'Silicone Free',
    description: 'Avoid all silicones',
    groups: ['silicones'],
    defaultStatus: 'warning'
  },
  mild_detergents_only: {
    id: 'mild_detergents_only',
    name: 'Mild Detergents Only',
    description: 'Only allow mild detergents',
    groups: ['detergents'],
    allowedCategories: ['mild_detergents'],
    defaultStatus: 'warning',
    allowedStatus: 'ok'
  },
  caution_water_soluble_silicones: {
    id: 'caution_water_soluble_silicones',
    name: 'Caution Water Soluble Silicones',
    description: 'Water soluble silicones are marked as caution, other silicones as warning',
    groups: ['silicones'],
    allowedCategories: ['water_soluble_silicone'],
    defaultStatus: 'warning',
    allowedStatus: 'caution'
  }
};

/**
 * Test systems for unit tests.
 */
export const testSystems: System[] = [
  {
    name: 'Curly Default',
    id: 'curly_default',
    description: 'The Curly Default system is a hair care system that focuses on using products that are free of harsh chemicals and sulfates.',
    settings: [
      'mild_detergents_only',
      'silicone_free'
    ]
  },
  {
    name: 'Curly Moderate',
    id: 'curly_moderate',
    description: 'Just like the default system, but allows for some water soluble silicones and moderate surfactants.',
    settings: [
      'sulfate_free',
      'caution_water_soluble_silicones'
    ]
  }
];
