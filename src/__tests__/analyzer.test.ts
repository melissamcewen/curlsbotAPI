import { analyzeIngredients } from '../utils/analyzer';

describe('analyzeIngredients', () => {
  test('should correctly analyze a list of ingredients', () => {
    const testIngredients = 'Water, Cetyl Alcohol, Isopropyl Alcohol';
    const results = analyzeIngredients(testIngredients);
    
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      name: 'Water',
      normalized: 'water',
      matched: false
    });
    
    expect(results[1]).toEqual({
      name: 'Cetyl Alcohol',
      normalized: 'cetyl alcohol',
      matched: true,
      details: expect.objectContaining({
        name: 'Cetyl Alcohol',
        category: ['fatty alcohol', 'emollient']
      }),
      categories: ['fatty alcohol', 'emollient']
    });
  });

  test('should handle unknown ingredients', () => {
    const testIngredients = 'Unknown Ingredient, Cetyl Alcohol';
    const results = analyzeIngredients(testIngredients);
    
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      name: 'Unknown Ingredient',
      normalized: 'unknown ingredient',
      matched: false
    });
  });

  test('should correctly identify sulfates and surfactants', () => {
    const testIngredients = 'Sodium Laureth Sulfate, Cocamidopropyl Betaine';
    const results = analyzeIngredients(testIngredients);
    
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      name: 'Sodium Laureth Sulfate',
      normalized: 'sodium laureth sulfate',
      matched: true,
      details: expect.objectContaining({
        name: 'Sodium Laureth Sulfate',
        category: ['sulfate', 'harsh cleanser']
      }),
      categories: ['sulfate', 'harsh cleanser']
    });
    
    expect(results[1]).toEqual({
      name: 'Cocamidopropyl Betaine',
      normalized: 'cocamidopropyl betaine',
      matched: true,
      details: expect.objectContaining({
        name: 'Cocamidopropyl Betaine',
        category: ['gentle cleanser', 'surfactant']
      }),
      categories: ['gentle cleanser', 'surfactant']
    });
  });

  test('should analyze complex ingredient list with annotations', () => {
    const testIngredients = 'Water (Aqua), Sodium Laureth Sulfate, Cocamidopropyl Betaine*, Sodium Chloride, Lavandula Angustifolia (Lavender) Oil*, Argania Spinosa Kernel Oil*, Cocos Nucifera (Coconut) Oil*, Glycol Distearate, Fragrance (Parfum), Sodium Benzoate, Citric Acid, Polyquaternium-10, Cocamide MEA, PPG-9, Disodium EDTA, Citronellol, Coumarin, Limonene, Linalool';
    const results = analyzeIngredients(testIngredients);
    
    // Find Sodium Laureth Sulfate
    const slesResult = results.find(r => r.normalized.includes('sodium laureth sulfate'));
    expect(slesResult).toBeDefined();
    expect(slesResult).toEqual({
      name: 'Sodium Laureth Sulfate',
      normalized: 'sodium laureth sulfate',
      matched: true,
      details: expect.objectContaining({
        name: 'Sodium Laureth Sulfate',
        category: ['sulfate', 'harsh cleanser']
      }),
      categories: ['sulfate', 'harsh cleanser']
    });

    // Find Cocamidopropyl Betaine
    const capbResult = results.find(r => r.normalized.includes('cocamidopropyl betaine'));
    expect(capbResult).toBeDefined();
    expect(capbResult).toEqual({
      name: 'Cocamidopropyl Betaine*',
      normalized: 'cocamidopropyl betaine',
      matched: true,
      details: expect.objectContaining({
        name: 'Cocamidopropyl Betaine',
        category: ['gentle cleanser', 'surfactant']
      }),
      categories: ['gentle cleanser', 'surfactant']
    });
  });
});