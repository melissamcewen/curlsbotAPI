import { Analyzer } from '../utils/analyzer';
import { testCategories } from './data/testCategories';
import { testIngredients } from './data/testIngredients';

describe('Analyzer', () => {
  const analyzer = new Analyzer({
    database: {
      ingredients: testIngredients,
      categories: testCategories,
    },
  });

  test('should analyze Keratin shampoo correctly', () => {
    const list = "Water (Aqua), Disodium Laureth Sulfosuccinate, Sodium C14-16 Olefin Sulfonate, Cocamidopropyl Betaine, Cocamidopropyl Hydroxysultaine, PEG-12 Dimethicone, Cocamide MIPA, Glycol Distearate, Hydrolyzed Keratin, Theobroma Cacao (Cocoa) Seed Butter, Fragrance (Parfum), Cocos Nucifera (Coconut) Oil, Persea Gratissima (Avocado) Oil, Aloe Barbadensis Leaf Extract, Panthenol, Polyquaternium-11, DMDM Hydantoin, Sodium Chloride, Cetyl Alcohol, Guar Hydroxypropyltrimonium Chloride, PEG-14M, Blue 1 (CI 42090), Red 40 (CI 16035), Yellow 5 (CI 19140).";

    const result = analyzer.analyze(list);

    // Check for cetyl alcohol
    const cetylAlcoholMatch = result.matches.find(
      match => match.name.toLowerCase().includes('cetyl alcohol')
    );
    expect(cetylAlcoholMatch).toBeDefined();
    expect(cetylAlcoholMatch?.categories).toContain('fatty alcohol');
    expect(cetylAlcoholMatch?.matchDetails?.searchType).toBe('ingredient');

    // Check for silicone
    const siliconeMatch = result.matches.find(
      match => match.name.toLowerCase().includes('dimethicone')
    );
    expect(siliconeMatch).toBeDefined();
    // Add expectations based on your silicone categories
  });

  test('should analyze Tresemme Runway Waves correctly', () => {
    const list = "Aqua (Water), Acrylates Copolymer, Glycerin, Propylene Glycol, Polysorbate 20, VP/Methacrylamide/Vinyl Imidazole Copolymer, Triethanolamine, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Ammonium Hydroxide, Caprylyl Glycol, Citric Acid, Disodium EDTA, Hydrolyzed Milk Protein, Hydroxyethylcellulose, Iodopropynyl Butylcarbamate, Lactic Acid, Laureth-7, Parfum (Fragrance), PEG/PPG-25/25 Dimethicone, PEG-10 Dimethicone, PEG-4 Dilaurate, PEG-4 Laurate, PEG-4, Phenoxyethanol, Phenylpropanol, Propanediol, Sodium Benzoate, Alpha-Isomethyl Ionone, Benzyl Alcohol, Butylphenyl Methylpropional, Citronellol, Geraniol, Hexyl Cinnamal, Hydroxycitronellal, Linalool";

    const result = analyzer.analyze(list);

    // Check for benzyl alcohol
    const benzylAlcoholMatch = result.matches.find(
      match => match.name.toLowerCase().includes('benzyl alcohol')
    );
    expect(benzylAlcoholMatch).toBeDefined();
    expect(benzylAlcoholMatch?.categories).toContain('solvent alcohol');

    // Check for silicones
    const siliconeMatches = result.matches.filter(
      match => match.name.toLowerCase().includes('dimethicone')
    );
    expect(siliconeMatches.length).toBeGreaterThan(0);
  });

  test('should analyze badly formatted list correctly', () => {
    const list = "Aqua (Water), Coco-Glucoside, Sodium Lauroyl Methyl Isethionate, Acrylates Copolymer, /n Parfum (Fragrance), Phenoxyethanol, Glycol Distearate, Laureth-4, Polyquaternium-10, Benzyl\nAlcohol, Hydroxypropyl Guar Hydroxypropyltrimonium Chloride";

    const result = analyzer.analyze(list);

    // Check that normalizer handled the bad formatting
    expect(result.matches.length).toBeGreaterThan(0);

    // Check for benzyl alcohol
    const benzylAlcoholMatch = result.matches.find(
      match => match.name.toLowerCase().includes('benzyl alcohol')
    );
    expect(benzylAlcoholMatch).toBeDefined();
    expect(benzylAlcoholMatch?.categories).toContain('solvent alcohol');
    
  });

  test('should handle empty ingredient list', () => {
    const result = analyzer.analyze('');
    expect(result.matches).toEqual([]);
    expect(result.categories).toEqual([]);
  });
});


