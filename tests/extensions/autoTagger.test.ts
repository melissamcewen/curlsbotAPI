import { frizzbot } from '../../src/extensions/autoTagger';
import { Analyzer } from '../../src/analyzer';
import { getBundledDatabase } from '../../src/data/bundledData';

// humidity resistant = < -50
describe('AutoTagger', () => {
  const analyzer = new Analyzer({ database: getBundledDatabase() });

  //* protein = ingredients in the category 'protein' or 'amino acids'
  describe('Protein-free products', () => {
    const ingredients =
      'aqua water, butylene glycol, polyquaternium-28, sericin, chamomilla recutita matricaria flower extract, actinidia chinensis kiwi fruit extract, lawsonia inermis henna extract, ';
    const analysis = analyzer.analyze(ingredients);
    const result = autoTagger(analysis);
    it('should tag this product as protein-free', () => {

    });
  });

  describe('product with protein', () => {
    const ingredients =
      'wheat amino acids, hydrolyzed wheat protein pvp crosspolymer, tocopheryl acetate, retinyl palmitate, panthenol, polyquaternium-7, guar hydroxypropyltrimonium chloride, behentrimonium chloride, cetrimonium chloride, peg-60 almond glycerides, glycerin, ppg-26-buteth-26, peg-40 hydrogenated castor oil, vp dmapa acrylates copolymer, hydroxyethylcellulose, potassium sorbate, disodium edta, hexylene glycol, caprylyl glycol, ethylhexylglycerin, phenoxyethanol, parfum fragrance, alpha-isomethyl ionone, benzyl benzoate, benzyl salicylate, butylphenyl methylpropional, citronellol, hexyl cinnamal, hydroxycitronellal, limonene, linalool';
    const analysis = analyzer.analyze(ingredients);
    const result = autoTagger(analysis);
    it('should tag this product as containing protein', () => {

    });
  });

// glycerin = specific ingredient

  describe('Product without glycerin', () => {
    const ingredients =
      'distilled water, fresh pineapple extract, aloe vera juice maltodextrin vp copolymer, gluconodeltalactone, sodium benzoate, hydoxyethycelluolose, hydrolyzed quinoa protein, phthalate-free fragrance';
    const analysis = analyzer.analyze(ingredients);
    const result = autoTagger(analysis);
    it('should auto-tag this product as glycerin-free', () => {

    });
  });


});
