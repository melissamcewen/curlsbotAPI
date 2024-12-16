import { describe, expect, it } from 'vitest';

import { Analyzer } from '../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../src/data/bundledData';

describe('Alcohol ingredient analysis', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    systems: defaultSystems,
    settings: defaultSettings,
  });

  it('should detect alcohol denat as a drying alcohol', () => {
    const result = analyzer.analyze('alcohol denat.', 'curly_default');
    expect(result.normalized).toEqual(['alcohol denat']);
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });

  it('should detect plain alcohol as a drying alcohol', () => {
    const result = analyzer.analyze('alcohol', 'curly_default');
    expect(result.normalized).toEqual(['alcohol']);
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });

  it('should detect denatured alcohol (sd alcohol 40)as a drying alcohol', () => {
    const result = analyzer.analyze(
      'denatured alcohol (sd alcohol 40)',
      'curly_default',
    );
    expect(result.normalized).toEqual(['denatured alcohol sd alcohol 40']);
    // should match the ingredient sd_alcohol since denatured alcohol is a synonym
    expect(result.matches[0].ingredient?.id).toBe('sd_alcohol');
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });

  it('should detect sd alcohol 40-b as a drying alcohol', () => {
    const result = analyzer.analyze(
      'sd alcohol 40-b (alcohol denat)',
      'curly_default',
    );
    expect(result.normalized).toEqual(['sd alcohol 40-b alcohol denat']);
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });

  it('should handle unknown alcohol variations', () => {
    const result = analyzer.analyze('hello alcohol', 'curly_default');
    const unknownMatch = result.matches.find(
      (match) => match.input === 'hello alcohol',
    );
    expect(unknownMatch).toBeDefined();
    expect(unknownMatch).toEqual(
      expect.objectContaining({
        input: 'hello alcohol',
        normalized: 'hello alcohol',
        categories: expect.any(Array),
        groups: expect.any(Array),
        flags: expect.any(Array),
      }),
    );
  });

  it('should recognize steareth alcohol-15 as a good alcohol', () => {
    const result = analyzer.analyze('Steareth Alcohol-15', 'curly_default');
    expect(result.normalized).toEqual(['steareth alcohol-15']);
    expect(result.matches[0].ingredient?.id).toBe('steareth_alcohol');
    expect(result.matches[0].confidence).toBeGreaterThan(0);

  });

  it('should recognize lauryl alcohol compounds as good alcohols', () => {
    const result = analyzer.analyze(
      'lauryl alcohol diphosphonic acid',
      'curly_default',
    );

  });

  it('should recognize benzyl alcohol compounds as good alcohols', () => {
    const result = analyzer.analyze(
      'benzyl alcohol benzyl benzoate',
      'curly_default',
    );

  });
});
