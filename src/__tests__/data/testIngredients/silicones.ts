import type { Ingredient } from '../../../types';

export const silicones: Record<string, Ingredient> = {
  cyclomethicone: {
    name: 'Cyclomethicone',
    description: 'A lightweight, volatile silicone that evaporates from hair.',
    category: ['water-soluble silicone'],
    notes: "Generally considered safe as it doesn't build up",
    synonyms: ['cyclopentasiloxane', 'cyclotetrasiloxane', 'cyclic silicone'],
  },
  dimethicone: {
    name: 'Dimethicone',
    description: 'A silicone that forms a protective barrier on the hair.',
    category: ['non-water-soluble silicone'],
    notes: 'Can build up on the hair and scalp',
    synonyms: ['dimethiconol'],
  },
};
