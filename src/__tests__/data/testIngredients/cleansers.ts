import type { Ingredient } from '@/types';

export const cleansers: Ingredient[] = [
  {
    name: 'Sodium Laureth Sulfate',
    description: 'A strong cleansing agent commonly found in shampoos',
    category: ['sulfate', 'harsh cleanser'],
    notes: 'Can be harsh and stripping on hair',
    synonyms: ['SLES', 'sodium lauryl ether sulfate'],
  },
  {
    name: 'Cocamidopropyl Betaine',
    description: 'A gentle surfactant derived from coconut oil',
    category: ['gentle cleanser', 'surfactant'],
    notes: 'Generally considered safe for curly hair routines',
    synonyms: ['CAPB', 'coco betaine'],
  },
];
