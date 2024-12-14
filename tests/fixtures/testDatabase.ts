import type { IngredientDatabase } from '../../src/types';

export const testDatabase: IngredientDatabase = {
  ingredients: {
    cetyl_alcohol: {
      id: 'cetyl_alcohol',
      name: 'Cetyl Alcohol',
      description: 'A fatty alcohol that acts as an emollient',
      categories: ['emollient_alcohol'],
      references: ['https://example.com/cetyl-alcohol'],
      synonyms: ['hexadecan-1-ol', '1-hexadecanol']
    },
    sd_alcohol: {
      id: 'sd_alcohol',
      name: 'SD Alcohol',
      categories: ['drying_alcohol'],
      references: ['https://example.com/sd-alcohol']
    },
    sodium_lauryl_sulfate: {
      id: 'sodium_lauryl_sulfate',
      name: 'Sodium Lauryl Sulfate',
      categories: ['sulfates'],
      references: ['https://example.com/sls']
    }
  },
  categories: {
    emollient_alcohol: {
      id: 'emollient_alcohol',
      name: 'Emollient Alcohol',
      description: 'Alcohols that moisturize and condition',
      group: 'alcohols'
    },
    drying_alcohol: {
      id: 'drying_alcohol',
      name: 'Drying Alcohol',
      description: 'Alcohols that can be drying',
      group: 'alcohols'
    },
    sulfates: {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Strong cleansing agents',
      group: 'detergents'
    }
  },
  groups: {
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
      description: 'Different types of alcohols used in hair care'
    },
    detergents: {
      id: 'detergents',
      name: 'Detergents',
      description: 'Cleansing agents used in hair care'
    }
  }
};
