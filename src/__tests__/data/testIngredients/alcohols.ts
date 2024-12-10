import type { Ingredient } from '../../../types';

export const alcohols: Ingredient[] = [
  {
    name: 'Cetyl Alcohol',
    description: 'A fatty alcohol that acts as an emollient and emulsifier',
    category: ['fatty alcohol'],
    notes: 'Common in conditioners and styling products',
    synonyms: ['cetearyl alcohol'],
    matchConfig: {
      matchType: ['exactMatch', 'fuzzyMatch'],
    },
  },
  {
    name: 'Isopropyl Alcohol',
    description: 'A drying alcohol that can be harsh on hair',
    category: ['drying alcohol'],
    notes: 'May be drying to hair and should be avoided in leave-in products',
  },
  {
    name: 'Denatured Alcohol',
    description: 'A type of alcohol used in cosmetics as a solvent',
    category: ['drying alcohol'],
    notes: 'Commonly used in cosmetics as a solvent',
    synonyms: ['alcohol denat', 'sd alcohol 40-b'],
    matchConfig: {
      partials: [
        'sd alcohol',
        'alcohol denat',
        'denatured alcohol',
        'alcohol 40-b',
        'denatured ethanol',
      ],
    },
  },
  {
    name: 'Benzyl Alcohol',
    description: 'A solvent and preservative used in cosmetics',
    category: ['solvent alcohol'],
  },
  {
    name: 'Alcohol',
    description: 'A generic term for any type of alcohol',
    category: ['drying alcohol'],
  },
];
