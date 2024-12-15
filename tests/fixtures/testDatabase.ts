import type { IngredientDatabase } from '../../src/types';

export const testDatabase: IngredientDatabase = {
  ingredients: {
    'sodium_laureth_sulfate': {
      id: 'sodium_laureth_sulfate',
      name: 'Sodium Laureth Sulfate',
      categories: ['surfactants', 'sulfates'],
      references: ['https://example.com/sles']
    },
    'cocamidopropyl_betaine': {
      id: 'cocamidopropyl_betaine',
      name: 'Cocamidopropyl Betaine',
      categories: ['surfactants', 'mild_detergents'],
      references: ['https://example.com/capb']
    },
    'glycerin': {
      id: 'glycerin',
      name: 'Glycerin',
      categories: ['humectants'],
      references: ['https://example.com/glycerin']
    },
    'dimethicone': {
      id: 'dimethicone',
      name: 'Dimethicone',
      categories: ['silicones', 'non_water_soluble_silicones'],
      references: ['https://example.com/dimethicone']
    },
    'witch_hazel': {
      id: 'witch_hazel',
      name: 'Witch Hazel',
      categories: ['astringents'],
      synonyms: ['witch', 'hamamelis', 'hamamellis', 'hazel']
    },
    'methylparaben': {
      id: 'methylparaben',
      name: 'Methylparaben',
      categories: ['parabens'],
      references: ['https://example.com/methylparaben']
    },
    'beeswax': {
      id: 'beeswax',
      name: 'Beeswax',
      categories: ['waxes', 'non_water_soluble_waxes'],
      references: ['https://example.com/beeswax'],
      synonyms: ['cera alba', 'natural wax from bees']
    },
    'cetyl_alcohol': {
      id: 'cetyl_alcohol',
      name: 'Cetyl Alcohol',
      categories: ['alcohols', 'emollient_alcohols'],
      references: ['https://example.com/cetyl-alcohol'],
      synonyms: ['hexadecan-1-ol', '1-hexadecanol']
    },
    'sd_alcohol': {
      id: 'sd_alcohol',
      name: 'SD Alcohol',
      categories: ['alcohols', 'drying_alcohols'],
      references: ['https://example.com/sd-alcohol']
    }
  },
  categories: {
    'surfactants': {
      id: 'surfactants',
      name: 'Surfactants',
      description: 'Cleansing agents used in hair care',
      group: 'detergents'
    },
    'mild_detergents': {
      id: 'mild_detergents',
      name: 'Mild Detergents',
      description: 'Gentle cleansing agents',
      group: 'detergents'
    },
    'sulfates': {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Strong cleansing agents',
      group: 'detergents'
    },
    'humectants': {
      id: 'humectants',
      name: 'Humectants',
      description: 'Ingredients that attract and hold moisture',
      group: 'others'
    },
    'silicones': {
      id: 'silicones',
      name: 'Silicones',
      description: 'Silicone-based ingredients',
      group: 'silicones'
    },
    'non_water_soluble_silicones': {
      id: 'non_water_soluble_silicones',
      name: 'Non-water-soluble Silicones',
      description: 'Silicones that require stronger cleansers to remove',
      group: 'silicones'
    },
    'astringents': {
      id: 'astringents',
      name: 'Astringents',
      description: 'Ingredients that can be drying',
      group: 'others'
    },
    'parabens': {
      id: 'parabens',
      name: 'Parabens',
      description: 'Preservatives that can be irritating',
      group: 'preservatives'
    },
    'waxes': {
      id: 'waxes',
      name: 'Waxes',
      description: 'Waxy ingredients',
      group: 'waxes'
    },
    'non_water_soluble_waxes': {
      id: 'non_water_soluble_waxes',
      name: 'Non-water-soluble Waxes',
      description: 'Waxes that require stronger cleansers to remove',
      group: 'waxes'
    },
    'water_soluble_waxes': {
      id: 'water_soluble_waxes',
      name: 'Water-soluble Waxes',
      description: 'Waxes that are easily removed with water',
      group: 'waxes'
    },
    'alcohols': {
      id: 'alcohols',
      name: 'Alcohols',
      description: 'Different types of alcohols used in hair care',
      group: 'alcohols'
    },
    'emollient_alcohols': {
      id: 'emollient_alcohols',
      name: 'Emollient Alcohols',
      description: 'Alcohols that moisturize and condition',
      group: 'alcohols'
    },
    'drying_alcohols': {
      id: 'drying_alcohols',
      name: 'Drying Alcohols',
      description: 'Alcohols that can be drying',
      group: 'alcohols'
    }
  },
  groups: {
    'detergents': {
      id: 'detergents',
      name: 'Detergents',
      description: 'Cleansing agents used in hair care'
    },
    'others': {
      id: 'others',
      name: 'Others',
      description: 'Miscellaneous ingredients'
    },
    'silicones': {
      id: 'silicones',
      name: 'Silicones',
      description: 'Silicone-based ingredients'
    },
    'preservatives': {
      id: 'preservatives',
      name: 'Preservatives',
      description: 'Ingredients that prevent product spoilage'
    },
    'waxes': {
      id: 'waxes',
      name: 'Waxes',
      description: 'Waxy ingredients that can build up'
    },
    'alcohols': {
      id: 'alcohols',
      name: 'Alcohols',
      description: 'Different types of alcohols used in hair care'
    }
  }
};
