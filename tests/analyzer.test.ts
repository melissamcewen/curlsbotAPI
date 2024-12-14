import { describe, it, expect } from 'vitest';
import { Analyzer } from '../src/analyzer';

// Test database
const testDatabase = {
  ingredients: {
    cetyl_alcohol: {
      id: 'cetyl_alcohol',
      name: 'Cetyl Alcohol',
      description: 'A fatty alcohol that acts as an emollient',
      categories: ['emollient_alcohol'],
      references: ['https://example.com/cetyl-alcohol'],
      synonyms: ['hexadecan-1-ol', '1-hexadecanol']
    },
    sd_alcohol: {
      id: 'sd_alcohol',
      name: 'SD Alcohol',
      categories: ['drying_alcohol'],
      references: ['https://example.com/sd-alcohol']
    }
  },
  categories: {
    emollient_alcohol: {
      id: 'emollient_alcohol',
      name: 'Emollient Alcohol',
      description: 'Alcohols that moisturize and condition',
      group: 'alcohols'
    },
    drying_alcohol: {
      id: 'drying_alcohol',
      name: 'Drying Alcohol',
      description: 'Alcohols that can be drying',
      group: 'alcohols'
    }
  },
  groups: {
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
      description: 'Different types of alcohols used in hair care'
    }
  }
};

describe('Analyzer', () => {
  it('should handle empty input', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('');

    expect(result.normalized).toEqual([]);
    expect(result.matches).toEqual([]);
    expect(result.categories).toEqual([]);
    expect(result.groups).toEqual([]);
  });

  it('should normalize and match basic ingredients', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

    expect(result.normalized).toEqual(['cetyl alcohol', 'sd alcohol']);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].ingredient?.id).toBe('cetyl_alcohol');
    expect(result.matches[1].ingredient?.id).toBe('sd_alcohol');
  });

  it('should handle ingredients with parentheses', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('Cetyl Alcohol (Emollient), SD Alcohol (Drying)');

    expect(result.normalized).toEqual(['cetyl alcohol', 'sd alcohol']);
    expect(result.matches).toHaveLength(2);
  });

  it('should collect unique categories and groups', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

    expect(result.categories).toEqual(['emollient_alcohol', 'drying_alcohol']);
    expect(result.groups).toEqual(['alcohols']);
  });

  it('should handle ingredients with different separators', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('Cetyl Alcohol | SD Alcohol & Water');

    expect(result.normalized).toHaveLength(3);
    expect(result.matches).toHaveLength(3);
  });

  it('should handle ingredients with line breaks and spaces', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('Cetyl Alcohol\nSD Alcohol\r\n  Water  ');

    expect(result.normalized).toHaveLength(3);
    expect(result.matches).toHaveLength(3);
  });

  it('should match ingredients by synonyms', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('hexadecan-1-ol');

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].ingredient?.id).toBe('cetyl_alcohol');
  });

  it('should apply flags when options are set', () => {
    const analyzer = new Analyzer({
      database: testDatabase,
      options: {
        flaggedIngredients: ['sd_alcohol'],
        flaggedCategories: ['drying_alcohol'],
        flaggedGroups: ['alcohols']
      }
    });

    const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

    expect(result.flags.ingredients).toEqual(['sd_alcohol']);
    expect(result.flags.categories).toEqual(['drying_alcohol']);
    expect(result.flags.groups).toEqual(['alcohols']);
  });

  it('should handle invalid URLs', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('http://example.com/ingredients');

    expect(result.normalized).toEqual([]);
    expect(result.matches).toEqual([]);
  });

  it('should generate unique UUIDs for each match', () => {
    const analyzer = new Analyzer({ database: testDatabase });
    const result = analyzer.analyze('Cetyl Alcohol, SD Alcohol');

    const uuids = new Set(result.matches.map(m => m.uuid));
    expect(uuids.size).toBe(2); // All UUIDs should be unique
  });
});
