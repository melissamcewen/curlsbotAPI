import type { Ingredient } from '../../../types';

export const alcohols: Record<string, Ingredient> = {
  cetyl_alcohol: {
    name: 'Cetyl Alcohol',
    description: 'A fatty alcohol that acts as an emollient and emulsifier',
    category: ['fatty alcohol'],
    notes: 'Common in conditioners and styling products',
    synonyms: ['cetearyl alcohol'],
    matchConfig: {
      matchType: ['exactMatch', 'fuzzyMatch'],
    },
  },
  isopropyl_alcohol: {
    name: 'Isopropyl Alcohol',
    description: 'A drying alcohol that can be harsh on hair',
    category: ['drying alcohol'],
    notes: 'May be drying to hair and should be avoided in leave-in products',
  },
  denatured_alcohol: {
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
  benzyl_alcohol: {
    name: 'Benzyl Alcohol',
    description: 'A solvent and preservative used in cosmetics',
    category: ['solvent alcohol'],
  },
  alcohol: {
    name: 'Alcohol',
    description: 'A generic term for any type of alcohol',
    category: ['drying alcohol'],
  },
};
