import { frizzbot } from '../../src/extensions/frizzbot';
import { Analyzer } from '../../src/analyzer';
import { getBundledDatabase } from '../../src/data/bundledData';

// humidity resistant = < -50
describe('frizzbot scoring', () => {
  const analyzer = new Analyzer({ database: getBundledDatabase() });

  describe('Ouidad Heat and Humidity', () => {
    const ingredients =
      'aqua water, butylene glycol, polyquaternium-28, sericin, chamomilla recutita matricaria flower extract, actinidia chinensis kiwi fruit extract, lawsonia inermis henna extract, wheat amino acids, hydrolyzed wheat protein pvp crosspolymer, tocopheryl acetate, retinyl palmitate, panthenol, polyquaternium-7, guar hydroxypropyltrimonium chloride, behentrimonium chloride, cetrimonium chloride, peg-60 almond glycerides, glycerin, ppg-26-buteth-26, peg-40 hydrogenated castor oil, vp dmapa acrylates copolymer, hydroxyethylcellulose, potassium sorbate, disodium edta, hexylene glycol, caprylyl glycol, ethylhexylglycerin, phenoxyethanol, parfum fragrance, alpha-isomethyl ionone, benzyl benzoate, benzyl salicylate, butylphenyl methylpropional, citronellol, hexyl cinnamal, hydroxycitronellal, limonene, linalool';
    const analysis = analyzer.analyze(ingredients);
    const result = frizzbot(analysis);
    it('should score Ouidad Heat and Humidity very well for anti-frizz', () => {
      expect(result.score).toBeLessThan(-50);
    });
  });

  describe('Miche Tropical Oasis', () => {
    const ingredients =
      'distilled water, fresh pineapple extract, aloe vera juice, glycerin, maltodextrin vp copolymer, gluconodeltalactone, sodium benzoate, hydoxyethycelluolose, hydrolyzed quinoa protein, phthalate-free fragrance';
    const analysis = analyzer.analyze(ingredients);
    const result = frizzbot(analysis);
    it('should score Miche Tropical Oasis very well for anti-frizz', () => {
      expect(result.score).toBeLessThan(-50);
    });
  });

  describe('Tootilab gel', () => {
    const ingredients =
      'water aqua, hydrolyzed corn starch, glycerin, guar hydroxypropyltrimonium chloride, hydroxyethylcellulose, citric acid, phenoxyethanol, benzyl alcohol, fragrance parfum, fructose, hydroxyacetophenone, sodium hydroxide, trisodium ethylenediamine disuccinate, polyglyceryl-4 caprate, ethylhexylglycerin, pentylene glycol, salicylic acid, sodium citrate, sodium hyaluronate, polyporus umbellatus mushroom extract, pogostemon cablin oil, tetramethyl acetyloctahydronaphthalenes, hexyl cinnamal, limonene, linalyl acetate, juniperus virginiana oil, citrus aurantium peel oil, alpha-isomethyl ionone, linalool';
    const analysis = analyzer.analyze(ingredients);
    const result = frizzbot(analysis);
    it('should score Tootilab gel very well for anti-frizz', () => {
      expect(result.score).toBeLessThan(-50);
    });
  });
});
