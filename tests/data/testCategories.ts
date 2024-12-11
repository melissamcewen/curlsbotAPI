import type { CategoryGroups } from '../../src/types';

export const testCategories: CategoryGroups = [
  {
    name: 'Alcohols',
    description: 'Different types of alcohols used in hair care',
    categories: [
      {
        name: 'fatty alcohol',
        description: 'Long-chain alcohols that condition',
        tags: ['Curly Friendly'],
        notes: 'Beneficial for hair',
      },
      {
        name: 'Drying Alcohol',
        description: 'Short-chain alcohols that can be drying',
        tags: ['Not Curly Friendly'],
        notes: 'Should be avoided in leave-in products',
      },
      {
        name: 'Solvent Alcohol',
        description: 'Alcohols used as solvents',
        tags: ['Curly Friendly'],
        notes: 'Commonly used in cosmetics as a solvent',
      },
    ],
  },
  {
    name: 'Cleansers',
    description: 'Ingredients that clean hair and scalp',
    categories: [
     {
        name: 'Sulfate',
        description: 'Strong cleansing agents',
        tags: ['Not Curly Friendly'],
        notes: 'Can be harsh and stripping',
      },
      {
        name: 'Gentle Cleanser',
        description: 'Mild cleansing agents',
        tags: ['Curly Friendly'],
        notes: 'Preferred for curly hair',
      },
      {
        name: 'Soap',
        description: 'Soap is a cleansing agent',
        tags: ['Not Curly Friendly'],
        notes: 'Can be harsh and stripping',
      },
    ],
  },
  {
    name: 'Others',
    description: 'Other ingredients not categorized',
    categories: [
      {
        name: 'Waxes',
        description: 'Waxes that are not water-soluble',
        tags: ['Not Curly Friendly'],
        notes:
          "Can build up and cause scalp issues if you don't use a clarifying shampoo",
      },
    ],
  },
  {
    name: 'Silicones',
    description: 'Different types of silicones used in hair care',
    categories: [
      {
        name: 'Water-Soluble Silicone',
        description: 'Silicones that are water-soluble',
        tags: ['Curly Friendly'],
        notes: "Generally considered safe as it doesn't build up",
      },
      {
        name: 'Non-Water-Soluble Silicone',
        description: 'Silicones that are not water-soluble',
        tags: ['Not Curly Friendly'],
        notes:
          "Can build up and cause scalp issues if you don't use a clarifying shampoo",
      },
    ],
  },
];
