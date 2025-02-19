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

  describe('kristin ess shampoo', () => {
    const ingredients =
      'water, sodium c14-16 olefin sulfonate, cocamidopropyl betaine, propanediol, glycol distearate, phenoxyethanol, butyrospermum parkii shea butter, alanine, arginine, aspartic acid, glycine, histidine, isoleucine, phenylalanine, proline, serine, sodium pca, pca, sodium lactate, threonine, valine, citric acid, disodium edta, glycine soja soybean oil, glycine soja soybean sterols, glycolipids, guar hydroxypropyltrimonium chloride, hydroxyethylcellulose, hydroxyacetophenone, lauryl lactyl lactate, peg-150 distearate, phospholipids, ricinus communis castor seed oil, fragrance';
    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score shampoo well for low porosity', () => {
      expect(result.low).toBeGreaterThan(80);
    });
  });

  describe('Curl Keeper Conditioner formulated to be light', () => {
    const ingredients =
      'water aqua eau, cetyl alcohol, cetearyl alcohol, behentrimonium chloride, glycerin, propanediol, stearamido-propyl dimethylamine, isopropyl myristate, cocos nucifera coconut water, aloe barbadensis leaf juice, chamomilla recutita matricaria flower extract, lavandula angustifolia lavender extract, cetyl esters, cetrimonium chloride, guar hydroxypropyltrimonium chloride, dicetyldimonium chloride, propylene glycol, caprylyl glycol, 1, 2-hexanediol, leuconostoc radish root ferment filtrate, fragrance parfum, potassiu, sorbate, panthenol, to-copheryl acetate, sodium benzoate, edta, citric acid, isopropyl alcohol, phenoxyethanol, ethylhexylglycerin, amyl cinnamal, limonene, isoeugenol, linalool';
    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score conditioner well for low porosity', () => {
      expect(result.low).toBeGreaterThan(80);
    });
  });

  describe('I create Hold', () => {
    const ingredients =
      'water, aqua-eau, aloe barbadensis gel, hydroxyethylcellulose, maltodextrin copolymer, potassium hydroxide, gluconolactone, sodium benzoate, calcium gluconate, alkyl acrylate crosspolymer, citrus aurantium dulcis peel oil, caprylic capric triglyceride, potassium sorbate, sodium phytate, glycerin, chamomilla recutita matricaria flower extract, eucalyptus globulus leaf extract, ginkgo biloba leaf extract, aspalathus linearis leaf extract, honey extract, limonene';
    const analysis = analyzer.analyze(ingredients);
    const result = porosity(analysis);
    it('should score gel decently for low porosity', () => {
      expect(result.low).toBeGreaterThan(75);
    });
  });
});
