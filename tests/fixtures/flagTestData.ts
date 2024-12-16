import type { System, Settings } from '../../src/types';

export const testSystem: System = {
  id: 'test_system',
  name: 'Test System',
  settings: ['sulfate_free', 'mild_detergents_only']
};

export const testSettings: Settings = {
  sulfate_free: {
    id: 'sulfate_free',
    name: 'Sulfate Free',
    description: 'Avoid sulfates',
    ingredients: ['sodium_laureth_sulfate'],
    categories: ['sulfates'],
    flags: ['avoid']
  },
  mild_detergents_only: {
    id: 'mild_detergents_only',
    name: 'Mild Detergents Only',
    description: 'Only allow mild detergents',
    ingredients: [],
    categories: ['mild_detergents'],
    flags: ['avoid_others_in_category']
  }
};

export const testCategories = {
  mild_detergents: { group: 'cleansing' },
  harsh_detergents: { group: 'cleansing' },
  sulfates: { group: 'cleansing' }
};
