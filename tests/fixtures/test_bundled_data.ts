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
    cyclomethicone: {
      id: 'cyclomethicone',
      name: 'Cyclomethicone',
      categories: ['evaporative_silicone'],
      synonyms: ['cyclicdimethylpolysiloxane', 'polydimethylcyclosiloxane'],
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
      categories: ['mild_surfactants'],
    },
    emulsifying_wax: {
      id: 'emulsifying_wax',
      name: 'Emulsifying Wax',
      categories: ['water_soluble_waxes'],
    },
    beeswax: {
      id: 'beeswax',
      name: 'Beeswax',
      categories: ['non_water_soluble_waxes'],
    },
    euphorbia_cerifera_wax: {
      id: 'euphorbia_cerifera_wax',
      name: 'Euphorbia Cerifera Wax',
      categories: ['non_water_soluble_waxes'],
    },
    lonincera_japonica_honeysuckle_flower_extract: {
      id: 'lonincera_japonica_honeysuckle_flower_extract',
      name: 'Lonincera Japonica Honeysuckle Flower Extract',
      categories: ['non_water_soluble_waxes'],
    },
    unknown_oil: {
      id: 'unknown_oil',
      name: 'Unknown Oil',
      categories: ['oils'],
    },
  },
  categories: {
    non_water_soluble_silicone: {
      id: 'non_water_soluble_silicone',
      name: 'Non-water-soluble Silicone',
      description: 'Silicones that are not water soluble',
      group: 'silicones',
    },
    water_soluble_silicone: {
      id: 'water_soluble_silicone',
      name: 'Water-soluble Silicone',
      description: 'Silicones that are water soluble',
      group: 'silicones',
      inclusions: ['peg', 'ppg'],
      exclusions: ['castor'],
      defaultIngredient: 'unknown_water_soluble_silicone',
    },
    evaporative_silicone: {
      id: 'evaporative_silicone',
      name: 'Evaporative Silicones',
      description: 'Silicones that evaporate from the hair',
      group: 'silicones',
    },
    sulfates: {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Sulfate-based cleansers',
      group: 'surfactants',
    },
    surfactants: {
      id: 'surfactants',
      name: 'Surfactants',
      description: 'Surface active agents',
      group: 'surfactants',
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
    mild_surfactants: {
      id: 'mild_surfactants',
      name: 'Mild surfactants',
      description: 'Gentle cleansing agents',
      group: 'surfactants',
    },
    non_water_soluble_waxes: {
      id: 'non_water_soluble_waxes',
      name: 'Non-water-soluble Waxes',
      description: 'Wax-based ingredients that are not water soluble',
      group: 'waxes',
    },
    water_soluble_waxes: {
      id: 'water_soluble_waxes',
      name: 'Water-soluble Waxes',
      description: 'Wax-based ingredients that are water soluble',
      group: 'waxes',
    },
    oils: {
      id: 'oils',
      name: 'Oils',
      description: 'Oil-based ingredients',
      group: 'oils',
      inclusions: ['oil'],
      defaultIngredient: 'unknown_oil',
    },
  },
  groups: {
    silicones: {
      id: 'silicones',
      name: 'Silicones',
      inclusions: ['cone', 'silicone'],
      exclusions: ['saccharomycessilicon', 'silicon ferment'],
      defaultIngredient: 'unknown_non_water_soluble_silicone',
    },
    surfactants: {
      id: 'surfactants',
      name: 'surfactants',
    },
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
    },
    waxes: {
      id: 'waxes',
      name: 'Waxes',
      inclusions: ['wax'],
    },
    oils: {
      id: 'oils',
      name: 'Oils',
      inclusions: ['oil'],
      defaultIngredient: 'unknown_oil',
      exclusions: ['castor'],
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
    defaultStatus: 'warning',
  },
  silicone_free: {
    id: 'silicone_free',
    name: 'Silicone Free',
    description: 'Avoid all silicones',
    groups: ['silicones'],
    defaultStatus: 'warning',
  },
  mild_surfactants_only: {
    id: 'mild_surfactants_only',
    name: 'Mild surfactants Only',
    description: 'Only allow mild surfactants',
    groups: ['surfactants'],
    allowedCategories: ['mild_surfactants'],
    defaultStatus: 'warning',
    allowedStatus: 'ok',
  },
  specific_ingredients: {
    id: 'specific_ingredients',
    name: 'Specific Ingredients',
    description: 'Warns about specific ingredients',
    ingredients: ['dimethicone', 'sodium_laureth_sulfate'],
    defaultStatus: 'warning',
  },
  caution_silicones: {
    id: 'caution_silicones',
    name: 'Caution Silicones',
    description: 'All silicones should be approached with caution.',
    groups: ['silicones'],
    defaultStatus: 'caution',
  },
  no_water_insoluble_silicones: {
    id: 'no_water_insoluble_silicones',
    name: 'No Water Insoluble Silicones',
    description: 'Avoiding all water insoluble silicones.',
    categories: ['non_water_soluble_silicone'],
    defaultStatus: 'warning',
  },
};

/**
 * Test systems for unit tests.
 */
export const testSystems: System[] = [
  {
    name: 'Curly Default',
    id: 'curly_default',
    description:
      'The Curly Default system is a hair care system that focuses on using products that are free of harsh chemicals and sulfates.',
    settings: ['mild_surfactants_only', 'silicone_free'],
  },
  {
    name: 'Curly Moderate',
    id: 'curly_moderate',
    description:
      'Just like the default system, but allows for some water soluble silicones and moderate surfactants.',
    settings: [
      'sulfate_free',
      'no_water_insoluble_silicones',
      'caution_silicones',
    ],
  },
];
