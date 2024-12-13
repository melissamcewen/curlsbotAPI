import { Analyzer } from '../../src/utils/analyzer';
import { testCategories } from '../data/testCategories';
import { testIngredients } from '../data/testIngredients';

export const analyzerFixtures = {
  testCases: {
    basicList: {
      input: 'Water, Sodium Lauryl Sulfate, Dimethicone.',
      expectedMatches: 3,
      expectedCategories: ['sulfate', 'non-water-soluble_silicone'],
      expectedIngredients: ['sodium lauryl sulfate', 'dimethicone'],
    },
    invalidInputs: {
      empty: '',
      null: null,
      undefined: undefined,
      number: 123,
      object: {},
      invalidFormat: '@@@@',
    },
  },
  createAnalyzer: (options = {}) => new Analyzer({
    database: {
      ingredients: testIngredients,
      categories: testCategories,
    },
    options,
  }),
};
