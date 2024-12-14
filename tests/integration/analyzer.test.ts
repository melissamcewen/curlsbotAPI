import { describe, it, expect } from 'vitest';
import { Analyzer } from '../../src/analyzer';
import { mockMainDatabase, mockFallbackDatabase } from '../fixtures/fallbackDatabase';

describe('Analyzer with fallback database', () => {
  it('initializes with fallback database', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase,
      fallbackDatabase: mockFallbackDatabase
    });

    expect(analyzer.getDatabase()).toEqual(mockMainDatabase);
    expect(analyzer.getFallbackDatabase()).toEqual(mockFallbackDatabase);
  });

  it('analyzes ingredients using main database', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase,
      fallbackDatabase: mockFallbackDatabase
    });

    const result = analyzer.analyze('Jojoba Oil');
    expect(result.matches[0].ingredient?.id).toBe('jojoba_oil');
    expect(result.categories).toContain('light_oils');
    expect(result.groups).toContain('oils');
  });

  it('analyzes ingredients using fallback database when not in main', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase,
      fallbackDatabase: mockFallbackDatabase
    });

    const result = analyzer.analyze('cone');
    expect(result.matches[0].ingredient?.id).toBe('unknown_non_water_soluble_silicones');
    expect(result.categories).toContain('non-water-soluble_silicones');
    expect(result.groups).toContain('silicones');
  });

  it('analyzes water soluble silicones using fallback', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase,
      fallbackDatabase: mockFallbackDatabase
    });

    const result = analyzer.analyze('peg');
    expect(result.matches[0].ingredient?.id).toBe('unknown_water_soluble_silicones');
    expect(result.categories).toContain('water-soluble_silicones');
    expect(result.groups).toContain('silicones');
  });

  it('analyzes sulfates using fallback', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase,
      fallbackDatabase: mockFallbackDatabase
    });

    const result = analyzer.analyze('sulfate');
    expect(result.matches[0].ingredient?.id).toBe('unknown_sulfates');
    expect(result.categories).toContain('sulfates');
    expect(result.groups).toContain('detergents');
  });

  it('handles mixed ingredients from both databases', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase,
      fallbackDatabase: mockFallbackDatabase
    });

    const result = analyzer.analyze('Jojoba Oil, cone, peg, sulfate');
    expect(result.matches).toHaveLength(4);

    // Check ingredients
    expect(result.matches[0].ingredient?.id).toBe('jojoba_oil');
    expect(result.matches[1].ingredient?.id).toBe('unknown_non_water_soluble_silicones');
    expect(result.matches[2].ingredient?.id).toBe('unknown_water_soluble_silicones');
    expect(result.matches[3].ingredient?.id).toBe('unknown_sulfates');

    // Check categories
    expect(result.categories).toContain('light_oils');
    expect(result.categories).toContain('non-water-soluble_silicones');
    expect(result.categories).toContain('water-soluble_silicones');
    expect(result.categories).toContain('sulfates');

    // Check groups
    expect(result.groups).toContain('oils');
    expect(result.groups).toContain('silicones');
    expect(result.groups).toContain('detergents');
  });

  it('handles ingredients not found in either database', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase,
      fallbackDatabase: mockFallbackDatabase
    });

    const result = analyzer.analyze('nonexistent ingredient');
    expect(result.matches[0].ingredient).toBeUndefined();
    expect(result.categories).toHaveLength(0);
    expect(result.groups).toHaveLength(0);
  });

  it('works correctly without fallback database', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase
    });

    const result = analyzer.analyze('cone, peg, sulfate');
    expect(result.matches).toHaveLength(3);
    result.matches.forEach(match => {
      expect(match.ingredient).toBeUndefined();
    });
    expect(result.categories).toHaveLength(0);
    expect(result.groups).toHaveLength(0);
  });

  it('allows updating fallback database after initialization', () => {
    const analyzer = new Analyzer({
      database: mockMainDatabase
    });

    // Initially no fallback
    let result = analyzer.analyze('cone, peg, sulfate');
    result.matches.forEach(match => {
      expect(match.ingredient).toBeUndefined();
    });

    // Add fallback database
    analyzer.setFallbackDatabase(mockFallbackDatabase);
    result = analyzer.analyze('cone, peg, sulfate');
    expect(result.matches[0].ingredient?.id).toBe('unknown_non_water_soluble_silicones');
    expect(result.matches[1].ingredient?.id).toBe('unknown_water_soluble_silicones');
    expect(result.matches[2].ingredient?.id).toBe('unknown_sulfates');
  });
});
