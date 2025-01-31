import { porosity } from '../../src/extensions/porosity';
import { Analyzer } from '../../src/analyzer';
import { getBundledDatabase } from '../../src/data/bundledData';

describe('porosity scoring', () => {
  const analyzer = new Analyzer({ database: getBundledDatabase() });

  describe('single ingredient products', () => {
    const ingredients = 'cocos nucifera (coconut) oil';
    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score coconut oil very poorly for low porosity', () => {
      expect(result.low).toBeLessThan(30);
    });
    it('should score coconut oil very well for high porosity', () => {
      // Coconut oil should score very well for high porosity
      expect(result.high).toBeGreaterThan(90);
    });
  });

  describe('heavy products', () => {
    const ingredients =
      'Water (Aqua, Eau), Stearyl Alcohol, Cetyl Alcohol, Butyrospermum Parkii (Shea) Butter, Phenoxyethanol, Parfum (Fragrance), Lactic Acid, Ethylhexylglycerin, Polyester-11, Panthenol';
    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score heavy products poorly for low porosity', () => {
      // Heavy products should score poorly for low porosity
      expect(result.low).toBeLessThan(50);
    });
    it('should score heavy products well for high porosity', () => {
      // But can still be good for high porosity
      expect(result.high).toBeGreaterThan(70);
    });
  });

  describe('low porosity friendly conditioner', () => {
    const ingredients =
      'aqua water, cetearyl alcohol, behentrimonium chloride, cyamopsis tetragonoloba guar gum, phytic acid, phenoxyethanol, chlorphenesin';

    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score lightweight conditioner well for low porosity', () => {
      // Should score well for low porosity
      expect(result.low).toBeGreaterThan(80);
    });
  });

  describe('neutral products', () => {
    const ingredients = 'water, aloe vera juice, citric acid, phenoxyethanol';

    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score products with mostly neutral ingredients well for low porosity', () => {
      // Should score high for low porosity
      expect(result.low).toBeGreaterThan(80);
    });

    it('should score products with mostly neutral ingredients poorly for high porosity', () => {
      // Should score low for high porosity
      expect(result.high).toBeLessThan(40);
    });
  });

  describe('low porosity friendly gel', () => {
    const ingredients =
      'flaxseed extract, agave nectar extract, pectin, aloe vera juice, marshmallow root extract, vitamin e, xanthan gum, optiphen plus, sweet orange essential oil';
    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score well for low porosity', () => {
      // Should score high for high porosity
      expect(result.low).toBeGreaterThan(80);
    });
  });

  describe('unknown oils', () => {
    const ingredients = 'some oil';
    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score unknown oils poorly for low porosity', () => {
      expect(result.low).toBeLessThan(30);
    });
  });
});
