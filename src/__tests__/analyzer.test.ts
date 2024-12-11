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

  test('should analyze a basic ingredient list', () => {
    const list = 'Water, Sodium Lauryl Sulfate, Dimethicone.';
    const result = analyzer.analyze(list);
    //expect 3 matches
    expect(result.matches.length).toBe(3);
    // expect one of the categories to be sulfate
    expect(result.categories).toContain('sulfate');
    // expect to match sodium lauryl sulfate
    expect(
      result.matches.find(
        (match) => match.normalized === 'sodium lauryl sulfate',
      ),
    ).toBeDefined();
    // expect to match dimethicone
    expect(
      result.matches.find((match) => match.normalized === 'dimethicone'),
    ).toBeDefined();
    // expect categories to contain  non-water-soluble silicone
    expect(result.categories).toContain('non-water-soluble silicone');
  });

  test('should analyze Keratin shampoo correctly', () => {
    const list =
      'Water (Aqua), Disodium Laureth Sulfosuccinate, Sodium C14-16 Olefin Sulfonate, Cocamidopropyl Betaine, Cocamidopropyl Hydroxysultaine, PEG-12 Dimethicone, Cocamide MIPA, Glycol Distearate, Hydrolyzed Keratin, Theobroma Cacao (Cocoa) Seed Butter, Fragrance (Parfum), Cocos Nucifera (Coconut) Oil, Persea Gratissima (Avocado) Oil, Aloe Barbadensis Leaf Extract, Panthenol, Polyquaternium-11, DMDM Hydantoin, Sodium Chloride, Cetyl Alcohol, Guar Hydroxypropyltrimonium Chloride, PEG-14M, Blue 1 (CI 42090), Red 40 (CI 16035), Yellow 5 (CI 19140).';

    const result = analyzer.analyze(list);

    // Check that we got some matches
    expect(result.matches.length).toBeGreaterThan(0);

    // Find the cetyl alcohol match
    const cetylAlcoholMatch = result.matches.find(
      (match) => match.normalized === 'cetyl alcohol',
    );
    expect(cetylAlcoholMatch).toBeDefined();
    expect(cetylAlcoholMatch?.categories).toContain('fatty alcohol');
  });

  test('should analyze Tresemme Runway Waves correctly', () => {
    const list =
      'Aqua (Water), Acrylates Copolymer, Glycerin, Propylene Glycol, Polysorbate 20, VP/Methacrylamide/Vinyl Imidazole Copolymer, Triethanolamine, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Ammonium Hydroxide, Caprylyl Glycol, Citric Acid, Disodium EDTA, Hydrolyzed Milk Protein, Hydroxyethylcellulose, Iodopropynyl Butylcarbamate, Lactic Acid, Laureth-7, Parfum (Fragrance), PEG/PPG-25/25 Dimethicone, PEG-10 Dimethicone, PEG-4 Dilaurate, PEG-4 Laurate, PEG-4, Phenoxyethanol, Phenylpropanol, Propanediol, Sodium Benzoate, Alpha-Isomethyl Ionone, Benzyl Alcohol, Butylphenyl Methylpropional, Citronellol, Geraniol, Hexyl Cinnamal, Hydroxycitronellal, Linalool';

    const result = analyzer.analyze(list);

    // Find the benzyl alcohol match
    const benzylAlcoholMatch = result.matches.find(
      (match) => match.normalized === 'benzyl alcohol',
    );
    expect(benzylAlcoholMatch).toBeDefined();
    expect(benzylAlcoholMatch?.categories).toContain('solvent alcohol');
  });

  test('should analyze badly formatted list correctly', () => {
    const list =
      'Aqua (Water), Coco-Glucoside, Sodium Lauroyl Methyl Isethionate, Acrylates Copolymer, /n Parfum (Fragrance), Phenoxyethanol, Glycol Distearate, Laureth-4, Polyquaternium-10, Benzyl\nAlcohol, Hydroxypropyl Guar Hydroxypropyltrimonium Chloride';

    const result = analyzer.analyze(list);

    // Check that normalizer handled the bad formatting
    expect(result.matches.length).toBeGreaterThan(0);

    // Find the benzyl alcohol match
    const benzylAlcoholMatch = result.matches.find(
      (match) => match.normalized === 'benzyl alcohol',
    );
    expect(benzylAlcoholMatch).toBeDefined();
    expect(benzylAlcoholMatch?.categories).toContain('solvent alcohol');
  });

  test('should handle empty ingredient list', () => {
    const result = analyzer.analyze('');
    expect(result.matches).toEqual([]);
    expect(result.categories).toEqual([]);
  });

  test('should return all categories from database', () => {
    const categories = analyzer.getCategories();

    // Verify we get an array of categories
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);

    // Verify specific categories exist
    // Note: Update these expectations based on your testCategories data
    expect(categories).toContain('fatty alcohol');
    expect(categories).toContain('solvent alcohol');

    // Verify no duplicates
    const uniqueCategories = new Set(categories);
    expect(categories.length).toBe(uniqueCategories.size);
  });

  test('should return all ingredients from database', () => {
    const ingredients = analyzer.getIngredients();

    // Verify we get an array of ingredients
    expect(Array.isArray(ingredients)).toBe(true);
    expect(ingredients.length).toBeGreaterThan(0);

    // Verify specific ingredients exist
    // Note: Update these based on your testIngredients data
    expect(ingredients).toContain('cetyl alcohol');
    expect(ingredients).toContain('benzyl alcohol');

    // Verify no duplicates
    const uniqueIngredients = new Set(ingredients);
    expect(ingredients.length).toBe(uniqueIngredients.size);
  });

  test('should handle invalid ingredient list', () => {
    // Using a list that the normalizer would mark as invalid
    const invalidList = '@@@@';

    const result = analyzer.analyze(invalidList);

    // Should return empty arrays as per analyzer.ts implementation
    expect(result.matches).toEqual([]);
    expect(result.categories).toEqual([]);
  });
});
