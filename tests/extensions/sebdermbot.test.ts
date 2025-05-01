import { sebderm } from '../../src/extensions/sebdermbot';
import { Analyzer } from '../../src/analyzer';
import { getBundledDatabase } from '../../src/data/bundledData';

describe('sebderm', () => {
  const analyzer = new Analyzer({ database: getBundledDatabase() });

  // Test oils group
  test('flags oils except for allowed exceptions', () => {
    const analysis = analyzer.analyze('Coconut Oil, Squalane');
    const result = sebderm(analysis);
    expect(result.hasTriggers).toBe(true);
    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].id).toBe('coconut_oil');
  });

  // Test specific emollient alcohols
  test('flags only specific problematic emollient alcohols', () => {
    const analysis = analyzer.analyze('Cetearyl Alcohol, Cetyl Alcohol');
    const result = sebderm(analysis);
    expect(result.hasTriggers).toBe(true);
    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].id).toBe('cetearyl_alcohol');
  });

  // Test waxes group
  test('flags all waxes', () => {
    const analysis = analyzer.analyze('Beeswax');
    const result = sebderm(analysis);
    expect(result.hasTriggers).toBe(true);
    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].id).toBe('beeswax');
  });

  // Test categories (esters, polysorbates, fatty acids)
  test('flags ingredients in trigger categories', () => {
    const analysis = analyzer.analyze(
      'Isopropyl Myristate, Polysorbate 20, Stearic Acid',
    );
    const result = sebderm(analysis);
    expect(result.hasTriggers).toBe(true);
    expect(result.triggers).toHaveLength(1);
    expect(result.triggers.map((t) => t.id)).toEqual([
      'polysorbate_20',
    ]);
  });

  // Test safe product
  test('identifies safe product with no triggers', () => {
    const analysis = analyzer.analyze('Squalane, Cetyl Alcohol');
    const result = sebderm(analysis);
    expect(result.hasTriggers).toBe(false);
    expect(result.triggers).toHaveLength(0);
  });

  // Test essential oils exception
  test('does not flag essential oils even though they are in oils group', () => {
    const analysis = analyzer.analyze('Lavender Oil, Coconut Oil');
    const result = sebderm(analysis);
    expect(result.hasTriggers).toBe(true);
    expect(result.triggers).toHaveLength(1);
    expect(result.triggers[0].id).toBe('coconut_oil');
  });


});
