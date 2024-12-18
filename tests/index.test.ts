import {
  Analyzer,
  matchIngredient,
  normalizer,
  // You can also import a type to verify it exists, but it won't affect runtime
} from '../src/index';

describe('Index exports', () => {
  it('should export all expected items', () => {
    expect(Analyzer).toBeDefined();
    expect(matchIngredient).toBeDefined();
  });
});
