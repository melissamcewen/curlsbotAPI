import type { Ingredient } from '../../../src/types';

export const silicones: Ingredient[] = [
  {
    name: 'Cyclomethicone',
    description: 'A lightweight, volatile silicone that evaporates from hair.',
    category: ['water-soluble silicone'],
    notes: "Generally considered safe as it doesn't build up",
    synonyms: ['cyclopentasiloxane', 'cyclotetrasiloxane', 'cyclic silicone'],
  },
  {
    name: 'Dimethicone',
    description: 'A silicone that forms a protective barrier on the hair.',
    category: ['non-water-soluble silicone'],
    notes: 'Can build up on the hair and scalp',
    synonyms: ['dimethiconol'],
  },
];
