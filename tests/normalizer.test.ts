import { normalizer } from '../src/utils/normalizer';

describe('normalizer', () => {
  it('should reject URLs', () => {
    const urlInputs = [
      'http://example.com',
      'https://test.com/ingredients',
      'www.ingredients.com',
      '//localhost:3000'
    ];

    urlInputs.forEach(url => {
      const result = normalizer(url);
      expect(result.isValid).toBe(false);
      expect(result.ingredients).toEqual([]);
    });
  });
});
