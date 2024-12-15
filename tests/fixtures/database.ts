export const testDatabase = {
  ingredients: {
    'sodium-laureth-sulfate': {
      id: 'sodium-laureth-sulfate',
      name: 'Sodium Laureth Sulfate',
      categories: ['surfactants', 'sulfates'],
      groups: []
    },
    'cocamidopropyl-betaine': {
      id: 'cocamidopropyl-betaine',
      name: 'Cocamidopropyl Betaine',
      categories: ['surfactants', 'mild_detergents'],
      groups: []
    },
    'glycerin': {
      id: 'glycerin',
      name: 'Glycerin',
      categories: ['humectants'],
      groups: []
    },
    'dimethicone': {
      id: 'dimethicone',
      name: 'Dimethicone',
      categories: ['silicones'],
      groups: []
    }
  },
  categories: {
    'surfactants': { id: 'surfactants', name: 'Surfactants' },
    'mild_detergents': { id: 'mild_detergents', name: 'Mild Detergents' },
    'sulfates': { id: 'sulfates', name: 'Sulfates' },
    'humectants': { id: 'humectants', name: 'Humectants' },
    'silicones': { id: 'silicones', name: 'Silicones' }
  },
  groups: {}
};

export const testSystems = [{
  name: "Test System",
  id: "test_system",
  description: "Test system",
  settings: ["mild_detergents_only"]
}];
