import { analyzeIngredients } from '../utils/analyzer';

describe('analyzeIngredients', () => {
  test('analyze Keratin shampoo correctly', () => {
    const list = "Water (Aqua), Disodium Laureth Sulfosuccinate, Sodium C14-16 Olefin Sulfonate, Cocamidopropyl Betaine, Cocamidopropyl Hydroxysultaine, PEG-12 Dimethicone, Cocamide MIPA, Glycol Distearate, Hydrolyzed Keratin, Theobroma Cacao (Cocoa) Seed Butter, Fragrance (Parfum), Cocos Nucifera (Coconut) Oil, Persea Gratissima (Avocado) Oil, Aloe Barbadensis Leaf Extract, Panthenol, Polyquaternium-11, DMDM Hydantoin, Sodium Chloride, Cetyl Alcohol, Guar Hydroxypropyltrimonium Chloride, PEG-14M, Blue 1 (CI 42090), Red 40 (CI 16035), Yellow 5 (CI 19140).";
    const results = analyzeIngredients(list);

    // Test specific ingredient matches
    const cetylAlcohol = results.matches.find(m => m.normalized.includes('cetyl alcohol'));
    expect(cetylAlcohol).toBeDefined();
    expect(cetylAlcohol?.matched).toBe(true);
    expect(cetylAlcohol?.categories).toContain('fatty alcohol');

    const dimethicone = results.matches.find(m => m.normalized.includes('dimethicone'));
    expect(dimethicone).toBeDefined();
    expect(dimethicone?.matched).toBe(true);
    expect(dimethicone?.categories).toContain('non-soluble silicone');

    // Test categories found
    expect(results.categories).toContain('fatty alcohol');
    expect(results.categories).toContain('emollient');
    expect(results.categories).toContain('non-soluble silicone');
  });

  test('analyze Tresemme Runway Waves correctly', () => {
    const list = "Aqua (Water), Acrylates Copolymer, Glycerin, Propylene Glycol, Polysorbate 20, VP/Methacrylamide/Vinyl Imidazole Copolymer, Triethanolamine, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Ammonium Hydroxide, Caprylyl Glycol, Citric Acid, Disodium EDTA, Hydrolyzed Milk Protein, Hydroxyethylcellulose, Iodopropynyl Butylcarbamate, Lactic Acid, Laureth-7, Parfum (Fragrance), PEG/PPG-25/25 Dimethicone, PEG-10 Dimethicone, PEG-4 Dilaurate, PEG-4 Laurate, PEG-4, Phenoxyethanol, Phenylpropanol, Propanediol, Sodium Benzoate, Alpha-Isomethyl Ionone, Benzyl Alcohol, Butylphenyl Methylpropional, Citronellol, Geraniol, Hexyl Cinnamal, Hydroxycitronellal, Linalool, Contains Milk Protein";
    const results = analyzeIngredients(list);

    // Test silicone matches
    const silicones = results.matches.filter(m => m.categories?.includes('non-soluble silicone'));
    expect(silicones.length).toBeGreaterThan(0);

    // Test alcohol matches
    const benzylAlcohol = results.matches.find(m => m.normalized.includes('benzyl alcohol'));
    expect(benzylAlcohol).toBeDefined();
    expect(benzylAlcohol?.matched).toBe(true);
    expect(benzylAlcohol?.categories).toContain('preservative alcohol');

    // Test categories found
    expect(results.categories).toContain('preservative alcohol');
    expect(results.categories).toContain('non-soluble silicone');
  });

  test('analyze ingredients with synonyms', () => {
    const list = "SLES, Cetostearyl Alcohol, IPA";
    const results = analyzeIngredients(list);

    // Test SLES synonym match
    const sles = results.matches.find(m => m.normalized === 'sles');
    expect(sles?.matched).toBe(true);
    expect(sles?.matchedSynonym).toBe('sles');
    expect(sles?.categories).toContain('sulfate');

    // Test Cetostearyl Alcohol synonym match
    const cetostearyl = results.matches.find(m => m.normalized.includes('cetostearyl alcohol'));
    expect(cetostearyl?.matched).toBe(true);
    expect(cetostearyl?.matchedSynonym).toBe('cetostearyl alcohol');
    expect(cetostearyl?.categories).toContain('fatty alcohol');

    // Test categories found
    expect(results.categories).toContain('sulfate');
    expect(results.categories).toContain('fatty alcohol');
    expect(results.categories).toContain('harsh cleanser');
  });
});