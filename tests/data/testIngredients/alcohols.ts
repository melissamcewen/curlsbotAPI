import type { Ingredient } from '../../../src/types';

export const alcohols: Ingredient[] = [
  {
    name: 'Cetyl Alcohol',
    description: 'A fatty alcohol that acts as an emollient and emulsifier',
    category: ['fatty_alcohol'],
    notes: 'Common in conditioners and styling products',
    synonyms: ['cetearyl alcohol'],
    id: 'cetyl_alcohol'
  },
  {
    name: 'Isopropyl Alcohol',
    description: 'A drying alcohol that can be harsh on hair',
    category: ['drying_alcohol'],
    notes: 'May be drying to hair and should be avoided in leave-in products',
    id: 'isopropyl_alcohol'
  },
  {
    name: 'Denatured Alcohol',
    description: 'A type of alcohol used in cosmetics as a solvent',
    category: ['drying_alcohol'],
    notes: 'Commonly used in cosmetics as a solvent',
    synonyms: ['alcohol denat', 'sd alcohol 40-b'],
    id: 'denatured_alcohol'
  },
  {
    name: 'Benzyl Alcohol',
    description: 'A solvent and preservative used in cosmetics',
    category: ['solvent_alcohol'],
    id: 'benzyl_alcohol'
  },
  {
    name: 'Alcohol',
    description: 'A generic term for any type of alcohol',
    category: ['drying_alcohol'],
    id: 'alcohol'
  },

];
