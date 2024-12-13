import type { CategoryGroups } from '../../src/types';

export const testCategories: CategoryGroups = [
  {
    name: 'Alcohols',
    description: 'Different types of alcohols used in hair care',
    id: 'alcohols',
    categories: [
      {
        name: 'Fatty Alcohol',
        description: 'Long-chain alcohols that condition',
        tags: ['Curly Friendly'],
        notes: 'Beneficial for hair',
        id: 'fatty_alcohol',
      },
      {
        name: 'Drying Alcohol',
        description: 'Short-chain alcohols that can be drying',
        tags: ['Not Curly Friendly'],
        notes: 'Should be avoided in leave-in products',
        id: 'drying_alcohol',
      },
      {
        name: 'Solvent Alcohol',
        description: 'Alcohols used as solvents',
        tags: ['Curly Friendly'],
        notes: 'Commonly used in cosmetics as a solvent',
        id: 'solvent_alcohol',
      },
    ],
  },
  {
    name: 'Cleansers',
    description: 'Ingredients that clean hair and scalp',
    id: 'cleansers',
    categories: [
     {
        name: 'Sulfate',
        description: 'Strong cleansing agents',
        tags: ['Not Curly Friendly'],
        notes: 'Can be harsh and stripping',
        id: 'sulfate',
      },
      {
        name: 'Gentle Cleanser',
        description: 'Mild cleansing agents',
        tags: ['Curly Friendly'],
        notes: 'Preferred for curly hair',
        id: 'gentle_cleanser',
      },
      {
        name: 'Soap',
        description: 'Soap is a cleansing agent',
        tags: ['Not Curly Friendly'],
        notes: 'Can be harsh and stripping',
        id: 'soap',
      },
    ],
  },
  {
    name: 'Others',
    description: 'Other ingredients not categorized',
    id: 'others',
    categories: [
      {
        name: 'Wax',
        description: 'Waxes that are not water-soluble',
        tags: ['Not Curly Friendly'],
        notes:
          "Can build up and cause scalp issues if you don't use a clarifying shampoo",
        id: 'wax',
      },
    ],
  },
  {
    name: 'Silicones',
    description: 'Different types of silicones used in hair care',
    id: 'silicones',
    categories: [
      {
        name: 'Water-soluble Silicone',
        description: 'Silicones that are water-soluble',
        tags: ['Curly Friendly'],
        notes: "Generally considered safe as it doesn't build up",
        id: 'water-soluble_silicone',
      },
      {
        name: 'Non-water-soluble Silicone',
        description: 'Silicones that are not water-soluble',
        tags: ['Not Curly Friendly'],
        notes:
          "Can build up and cause scalp issues if you don't use a clarifying shampoo",
        id: 'non-water-soluble_silicone',
      },
    ],
  },
];
