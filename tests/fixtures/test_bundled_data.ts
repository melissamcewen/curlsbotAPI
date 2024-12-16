import type { IngredientDatabase, Settings } from '../../src/types';

/**
 * Main test database for unit tests.
 * This database contains a comprehensive set of test ingredients and categories
 * that cover various test scenarios.
 */
export const testDatabase: IngredientDatabase = {
  ingredients: {
    sodium_laureth_sulfate: {
      id: 'sodium_laureth_sulfate',
      name: 'Sodium Laureth Sulfate',
      categories: ['surfactants', 'sulfates'],
      references: ['https://example.com/sles'],
    },
    cocamidopropyl_betaine: {
      id: 'cocamidopropyl_betaine',
      name: 'Cocamidopropyl Betaine',
      categories: ['surfactants', 'mild-detergents'],
      references: ['https://example.com/capb'],
    },
    glycerin: {
      id: 'glycerin',
      name: 'Glycerin',
      categories: ['humectants'],
      references: ['https://example.com/glycerin'],
    },
    dimethicone: {
      id: 'dimethicone',
      name: 'Dimethicone',
      categories: ['silicones', 'non-water-soluble_silicones'],
      references: ['https://example.com/dimethicone'],
    },
    witch_hazel: {
      id: 'witch_hazel',
      name: 'Witch Hazel',
      categories: ['astringents'],
      synonyms: ['witch', 'hamamelis', 'hamamellis', 'hazel'],
    },
    methylparaben: {
      id: 'methylparaben',
      name: 'Methylparaben',
      categories: ['parabens'],
      references: ['https://example.com/methylparaben'],
    },
    propylparaben: {
      id: 'propylparaben',
      name: 'Propylparaben',
      categories: ['parabens'],
      references: ['https://example.com/propylparaben'],
    },
    butylparaben: {
      id: 'butylparaben',
      name: 'Butylparaben',
      categories: ['parabens'],
      references: ['https://example.com/butylparaben'],
    },
    cetyl_alcohol: {
      id: 'cetyl_alcohol',
      name: 'Cetyl Alcohol',
      categories: ['alcohols', 'emollient_alcohols'],
      references: ['https://example.com/cetyl-alcohol'],
      synonyms: ['hexadecan-1-ol', '1-hexadecanol'],
    },
    sd_alcohol: {
      id: 'sd_alcohol',
      name: 'SD Alcohol',
      categories: ['alcohols', 'drying_alcohols'],
      references: ['https://example.com/sd-alcohol'],
      synonyms: [
        'alcohol denat',
        'alcohol-40b',
        'denatured alcohol',
        'sd alcohol 40',
        'sugarcane derived alcohol',
        'alcohol',
      ],
    },
    alcohol_denat: {
      id: 'alcohol_denat',
      name: 'Alcohol Denat',
      categories: ['alcohols', 'drying_alcohols'],
      references: ['https://example.com/alcohol-denat'],
    },
    ethyl_alcohol: {
      id: 'ethyl_alcohol',
      name: 'Ethyl Alcohol',
      categories: ['alcohols', 'drying_alcohols'],
      references: ['https://example.com/ethyl-alcohol'],
      synonyms: [
        'grain alcohol',
        'sugarcane-derived alcohol',
        'sugarcane alcohol',
      ],
    },
    beeswax: {
      id: 'beeswax',
      name: 'Beeswax',
      categories: ['waxes', 'non-water-soluble_waxes'],
      references: ['https://example.com/beeswax'],
      synonyms: ['cera alba', 'natural wax from bees'],
    },
    candelilla_wax: {
      id: 'candelilla_wax',
      name: 'Candelilla Wax',
      categories: ['waxes', 'non-water-soluble_waxes'],
      references: ['https://example.com/candelilla-wax'],
    },
    emulsifying_wax_nf: {
      id: 'emulsifying_wax_nf',
      name: 'Emulsifying Wax NF',
      categories: ['water-soluble_waxes'],
      references: ['https://example.com/emulsifying-wax'],
    },
    sodium_c14_16_olefin_sulfonate: {
      id: 'sodium_c14_16_olefin_sulfonate',
      name: 'Sodium C14-16 Olefin Sulfonate',
      categories: ['sulfonates'],
      references: ['https://example.com/olefin-sulfonate'],
    },
  },
  categories: {
    surfactants: {
      id: 'surfactants',
      name: 'Surfactants',
      description: 'Cleansing agents used in hair care',
      group: 'detergents',
    },
    'mild-detergents': {
      id: 'mild-detergents',
      name: 'Mild Detergents',
      description: 'Gentle cleansing agents',
      group: 'detergents',
    },
    sulfates: {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Strong cleansing agents',
      group: 'detergents',
    },
    sulfonates: {
      id: 'sulfonates',
      name: 'Sulfonates',
      description: 'Sulfonate-based cleansing agents',
      group: 'detergents',
    },
    humectants: {
      id: 'humectants',
      name: 'Humectants',
      description: 'Ingredients that attract and hold moisture',
      group: 'others',
    },
    silicones: {
      id: 'silicones',
      name: 'Silicones',
      description: 'Silicone-based ingredients',
      group: 'silicones',
    },
    'non-water-soluble_silicones': {
      id: 'non-water-soluble_silicones',
      name: 'Non-water-soluble Silicones',
      description: 'Silicones that require stronger cleansers to remove',
      group: 'silicones',
    },
    'water-soluble_silicones': {
      id: 'water-soluble_silicones',
      name: 'Water-soluble Silicones',
      description: 'Silicones that are easily removed with water',
      group: 'silicones',
    },
    astringents: {
      id: 'astringents',
      name: 'Astringents',
      description: 'Ingredients that can be drying',
      group: 'others',
    },
    parabens: {
      id: 'parabens',
      name: 'Parabens',
      description: 'Preservatives that can be irritating',
      group: 'preservatives',
    },
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
      description: 'Different types of alcohols used in hair care',
      group: 'alcohols',
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
      description: 'Alcohols that can be drying',
      group: 'alcohols',
    },
    waxes: {
      id: 'waxes',
      name: 'Waxes',
      description: 'Waxy ingredients',
      group: 'waxes',
    },
    'non-water-soluble_waxes': {
      id: 'non-water-soluble_waxes',
      name: 'Non-water-soluble Waxes',
      description: 'Waxes that require stronger cleansers to remove',
      group: 'waxes',
    },
    'water-soluble_waxes': {
      id: 'water-soluble_waxes',
      name: 'Water-soluble Waxes',
      description: 'Waxes that are easily removed with water',
      group: 'waxes',
    },
  },
  groups: {
    detergents: {
      id: 'detergents',
      name: 'Detergents',
    },
    others: {
      id: 'others',
      name: 'Others',
    },
    silicones: {
      id: 'silicones',
      name: 'Silicones',
    },
    preservatives: {
      id: 'preservatives',
      name: 'Preservatives',
    },
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
    },
    waxes: {
      id: 'waxes',
      name: 'Waxes',
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
    ingredients: ['sodium_laureth_sulfate'],
    categories: ['sulfates'],
    flags: ['avoid_sulfates'],
  },
  silicone_free: {
    id: 'silicone_free',
    name: 'Silicone Free',
    description: 'Avoid silicones',
    ingredients: ['dimethicone'],
    categories: ['non-water-soluble_silicones'],
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

