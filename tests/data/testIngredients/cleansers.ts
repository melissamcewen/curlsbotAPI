import type { Ingredient } from '../../../src/types';

export const cleansers: Ingredient[] = [
  {
    name: 'Sodium Laureth Sulfate',
    description: 'A strong cleansing agent commonly found in shampoos',
    category: ['sulfate'],
    notes: 'Can be harsh and stripping on hair',
    synonyms: ['SLES', 'sodium lauryl ether sulfate'],
    id: 'sodium_laureth_sulfate'
  },
  {
    name: 'Sodium Lauryl Sulfate',
    description: 'A strong cleansing agent commonly found in shampoos',
    category: ['sulfate'],
    notes: 'Can be harsh and stripping on hair',
    synonyms: ['SLS', 'sodium lauryl sulfate'],
    id: 'sodium_lauryl_sulfate'
  },
  {
    name: 'Cocamidopropyl Betaine',
    description: 'A gentle surfactant derived from coconut oil',
    category: ['gentle_cleanser'],
    notes: 'Generally considered safe for curly hair routines',
    synonyms: ['CAPB', 'coco betaine'],
    id: 'cocamidopropyl_betaine'
  },
];
