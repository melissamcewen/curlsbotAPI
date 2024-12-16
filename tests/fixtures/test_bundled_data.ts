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
      categories: ['non-water-soluble_silicone'],
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
      categories: ['water-soluble_silicone'],
    },
    unknown_non_water_soluble_silicone: {
      id: 'unknown_non_water_soluble_silicone',
      name: 'Unknown Non-water-soluble Silicone',
      categories: ['non-water-soluble_silicone'],
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
    'non-water-soluble_silicone': {
      id: 'non-water-soluble_silicone',
      name: 'Non-water-soluble Silicone',
      description: 'Silicones that are not water soluble',
      group: 'silicones',
    },
    'water-soluble_silicone': {
      id: 'water-soluble_silicone',
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
export const testSettings: Record<string, Setting> = {
  sulfate_free: {
    id: 'sulfate_free',
    name: 'Sulfate Free',
    description: 'Avoid sulfates',
    flags: [
      {
        type: 'category',
        flag_type: 'avoid',
        id: 'sulfates',
      },
    ],
  },
  silicone_free: {
    id: 'silicone_free',
    name: 'Silicone Free',
    description: 'Avoid silicones',
    flags: [
      {
        type: 'category',
        flag_type: 'avoid',
        id: 'non-water-soluble_silicone',
      },
    ],
  },
  mild_detergents_only: {
    id: 'mild_detergents_only',
    name: 'Mild Detergents Only',
    description: 'Only allow mild detergents',
    flags: [
      {
        type: 'category',
        flag_type: 'avoid_others_in_group',
        id: 'mild_detergents'
      },
    ],
  },
  detergents_caution: {
    id: 'detergents_caution',
    name: 'Detergents Caution',
    description: 'Use caution with detergents',
    flags: [
      {
        type: 'group',
        flag_type: 'caution',
        id: 'detergents',
      },
    ],
  },
};

/**
 * Test systems for unit tests.
 */
export const testSystems: System[] = [
  {
    id: 'sulfate_free_system',
    name: 'Sulfate Free System',
    description: 'System that avoids sulfates',
    settings: ['sulfate_free'],
  },
  {
    id: 'silicone_free_system',
    name: 'Silicone Free System',
    description: 'System that avoids silicones',
    settings: ['silicone_free'],
  },
  {
    id: 'mild_detergents_system',
    name: 'Mild Detergents System',
    description: 'System that only allows mild detergents',
    settings: ['mild_detergents_only'],
  },
  {
    id: 'detergents_caution_system',
    name: 'Detergents Caution System',
    description: 'System that flags detergents with caution',
    settings: ['detergents_caution'],
  },
];
