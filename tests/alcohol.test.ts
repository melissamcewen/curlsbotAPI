import { describe, expect, it } from 'vitest';

import { Analyzer } from '../src/analyzer';
import {
  defaultDatabase,
  defaultSystems,
  defaultSettings,
} from '../src/data/bundledData';
 const analyzer = new Analyzer({
   database: defaultDatabase,
   systems: defaultSystems,
   settings: defaultSettings,
 });

 import { Flags } from '../src/types';

 describe('Known alcohol with period at the end', () => {
  it('should detect "alcohol denat." as sd_alcohol', () => {
    const result = analyzer.analyze('alcohol denat.', 'curly_default');
    expect(result.normalized).toEqual(['alcohol denat']);
    expect(result.matches[0].ingredient?.id).toBe('sd_alcohol');
  });

  it('should detect "alcohol denat." as a drying alcohol', () => {
    const result = analyzer.analyze('alcohol denat.', 'curly_default');
    expect(result.normalized).toEqual(['alcohol denat']);
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });

 });

 describe('Known alcohol with parentheses', () => {

  it('should detect denatured alcohol (sd alcohol 40) as sd_alcohol', () => {
    const result = analyzer.analyze('denatured alcohol (sd alcohol 40)', 'curly_default');
    expect(result.normalized).toEqual(['denatured alcohol sd alcohol 40']);
    expect(result.matches[0].ingredient?.id).toBe('sd_alcohol');
  });

  it('should detect denatured alcohol (sd alcohol 40) as a drying alcohol', () => {
    const result = analyzer.analyze('denatured alcohol (sd alcohol 40)', 'curly_default');
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });


 });

 describe('The word "alcohol" by itself', () => {
  it('should detect just the word "alcohol" as "unknown_alcohol"', () => {
    const result = analyzer.analyze('alcohol', 'curly_default');
    expect(result.normalized).toEqual(['alcohol']);
    expect(result.matches[0].ingredient?.id).toBe('unknown_alcohol');
  });

  it('should detect just the word "alcohol" as a drying alcohol', () => {
    const result = analyzer.analyze('alcohol', 'curly_default');
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });
});

describe('sd alcohol 40-b', () => {
  it('should detect "sd alcohol 40-b" as sd_alcohol', () => {
    const result = analyzer.analyze('sd alcohol 40-b', 'curly_default');
    expect(result.normalized).toEqual(['sd alcohol 40-b']);
    expect(result.matches[0].ingredient?.id).toBe('sd_alcohol');
  });

  it('should categorize "sd alcohol 40-b" as drying alcohols', () => {
    const result = analyzer.analyze('sd alcohol 40-b', 'curly_default');
    expect(result.matches[0].categories).toEqual(['drying_alcohols']);
  });

  it('should group "sd alcohol 40-b" as alcohols', () => {
    const result = analyzer.analyze('sd alcohol 40-b', 'curly_default');
    expect(result.matches[0].groups).toEqual(['alcohols']);
  });

  it('should flag "sd alcohol 40-b" as a drying alcohol to avoid when analyzed under the curly_default system', () => {
   const flags: Flags = {
     drying_alcohols: {
       type: 'ingredient',
       flag_type: 'avoid',
       settingId: 'no_drying_alcohols',
     },
   };

    const result = analyzer.analyze('sd alcohol 40-b', 'curly_default');
    expect(result.flags).toEqual(flags);
  });

  it('should detect "steareth alcohol-15" as "steareth_alcohol"', () => {
    const result = analyzer.analyze('steareth alcohol-15', 'curly_default');
    expect(result.normalized).toEqual(['steareth alcohol-15']);
    expect(result.matches[0].ingredient?.id).toBe('steareth_alcohol');
  });

  it('should detect "steareth alcohol-15" as a emollient alcohol', () => {
    const result = analyzer.analyze('steareth alcohol-15', 'curly_default');
    const emollients = result.matches.filter((match) =>
      match.flags.includes('emollients'),
    );
    expect(emollients).toHaveLength(1);
  });
});

describe('Unknown alcohol', () => {
  it('should detect "XYZ alcohol" as unknown_alcohol', () => {
    const result = analyzer.analyze('XYZ alcohol', 'curly_default');
    expect(result.normalized).toEqual(['XYZ alcohol']);
    expect(result.matches[0].ingredient?.id).toBe('unknown_alcohol');
  });

  it('should detect "XYZ alcohol" as a drying alcohol', () => {
    const result = analyzer.analyze('XYZ alcohol', 'curly_default');
    const dryingAlcohols = result.matches.filter((match) =>
      match.flags?.includes('drying_alcohols'),
    );
    expect(dryingAlcohols).toHaveLength(1);
  });
});

describe('Alcohol ingredient analysis', () => {

  //** these are e2e tests and uses the production db */



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
