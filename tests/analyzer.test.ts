import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { Analyzer } from '../src/analyzer';

const TEST_CONFIG_DIR = join(__dirname, 'fixtures/config');

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
    },
    sodium_lauryl_sulfate: {
      id: 'sodium_lauryl_sulfate',
      name: 'Sodium Lauryl Sulfate',
      categories: ['sulfates'],
      references: ['https://example.com/sls']
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
    },
    sulfates: {
      id: 'sulfates',
      name: 'Sulfates',
      description: 'Strong cleansing agents',
      group: 'detergents'
    }
  },
  groups: {
    alcohols: {
      id: 'alcohols',
      name: 'Alcohols',
      description: 'Different types of alcohols used in hair care'
    },
    detergents: {
      id: 'detergents',
      name: 'Detergents',
      description: 'Cleansing agents used in hair care'
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

    expect(result.flags).toEqual({
      flaggedIngredients: ['sd_alcohol'],
      flaggedCategories: ['drying_alcohol'],
      flaggedGroups: ['alcohols']
    });

    // Check that matches have correct flags
    const sdAlcoholMatch = result.matches.find(m => m.ingredient?.id === 'sd_alcohol');
    expect(sdAlcoholMatch?.flags).toContain('sd_alcohol');
    expect(sdAlcoholMatch?.flags).toContain('drying_alcohol');
    expect(sdAlcoholMatch?.flags).toContain('alcohols');
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

  describe('System Analysis', () => {
    it('should set system ID in result', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        configDir: TEST_CONFIG_DIR
      });
      const result = analyzer.analyze('Cetyl Alcohol', 'curly_default');

      expect(result.system).toBe('curly_default');
      expect(result.settings).toEqual(['sulfate_free']);
    });

    it('should flag sulfates in sulfate_free setting', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        configDir: TEST_CONFIG_DIR
      });
      const result = analyzer.analyze('Sodium Lauryl Sulfate', 'curly_default');

      expect(result.flags.flaggedCategories).toContain('sulfates');

      // Check that the match has the flag
      const match = result.matches.find(m => m.ingredient?.id === 'sodium_lauryl_sulfate');
      expect(match?.flags).toContain('sulfates');
    });

    it('should handle unknown system IDs', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        configDir: TEST_CONFIG_DIR
      });
      const result = analyzer.analyze('Cetyl Alcohol', 'unknown_system');

      expect(result.system).toBe('unknown_system');
      expect(result.settings).toEqual([]);
      expect(result.flags).toEqual({
        flaggedIngredients: [],
        flaggedCategories: [],
        flaggedGroups: []
      });
    });

    it('should combine system flags with analyzer options', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        configDir: TEST_CONFIG_DIR,
        options: {
          flaggedIngredients: ['cetyl_alcohol']
        }
      });
      const result = analyzer.analyze('Sodium Lauryl Sulfate, Cetyl Alcohol', 'curly_default');

      expect(result.flags.flaggedCategories).toContain('sulfates'); // From system
      expect(result.flags.flaggedIngredients).toContain('cetyl_alcohol'); // From options

      // Check that matches have correct flags
      const sulfateMatch = result.matches.find(m => m.ingredient?.id === 'sodium_lauryl_sulfate');
      expect(sulfateMatch?.flags).toContain('sulfates');

      const cetylMatch = result.matches.find(m => m.ingredient?.id === 'cetyl_alcohol');
      expect(cetylMatch?.flags).toContain('cetyl_alcohol');
    });

    it('should set success status for valid analysis', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        configDir: TEST_CONFIG_DIR
      });
      const result = analyzer.analyze('Cetyl Alcohol', 'curly_default');

      expect(result.status).toBe('success');
    });

    it('should set error status for invalid input', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        configDir: TEST_CONFIG_DIR
      });
      const result = analyzer.analyze('http://example.com', 'curly_default');

      expect(result.status).toBe('error');
    });

    it('should allow getting and setting systems', () => {
      const analyzer = new Analyzer({
        database: testDatabase,
        configDir: TEST_CONFIG_DIR
      });

      const systems = analyzer.getSystems();
      expect(systems).toHaveLength(2);
      expect(systems[0].id).toBe('curly_default');
      expect(systems[1].id).toBe('no_poo');
    });
  });
});
