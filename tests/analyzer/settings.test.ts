import { test, expect } from 'vitest';
import { Analyzer } from '../../src/analyzer';
import { testSettings } from '../fixtures/config/testConfig';

test('analyzer handles avoid_others flag correctly', () => {
  const testDatabase = {
    ingredients: {
      'sodium-laureth-sulfate': {
        id: 'sodium-laureth-sulfate',
        name: 'Sodium Laureth Sulfate',
        categories: ['surfactants', 'harsh_surfactants'],
        groups: []
      },
      'cocamidopropyl-betaine': {
        id: 'cocamidopropyl-betaine',
        name: 'Cocamidopropyl Betaine',
        categories: ['surfactants', 'mild_detergents'],
        groups: []
      },
      'glycerin': {
        id: 'glycerin',
        name: 'Glycerin',
        categories: ['humectants'],
        groups: []
      }
    },
    categories: {
      'surfactants': { id: 'surfactants', name: 'Surfactants' },
      'mild_detergents': { id: 'mild_detergents', name: 'Mild Detergents' },
      'harsh_surfactants': { id: 'harsh_surfactants', name: 'Harsh Surfactants' },
      'humectants': { id: 'humectants', name: 'Humectants' }
    },
    groups: {}
  };

  const testSystems = [{
    name: "Test System",
    id: "test_system",
    description: "Test system",
    settings: ["mild_detergents_only"]
  }];

  const analyzer = new Analyzer({
    database: testDatabase,
    systems: testSystems,
    settings: testSettings
  });

  // Test with a harsh surfactant - should be flagged
  const resultHarsh = analyzer.analyze('Sodium Laureth Sulfate', 'test_system');
  expect(resultHarsh.matches[0].flags).toHaveLength(1);

  // Test with a mild surfactant - should not be flagged
  const resultMild = analyzer.analyze('Cocamidopropyl Betaine', 'test_system');
  expect(resultMild.matches[0].flags).toHaveLength(0);

  // Test with a non-surfactant - should not be flagged
  const resultNonSurfactant = analyzer.analyze('Glycerin', 'test_system');
  expect(resultNonSurfactant.matches[0].flags).toHaveLength(0);

  // Test with multiple ingredients
  const resultMixed = analyzer.analyze('Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin', 'test_system');
  expect(resultMixed.matches[0].flags).toHaveLength(1); // SLES should be flagged
  expect(resultMixed.matches[1].flags).toHaveLength(0); // CAPB should not be flagged
  expect(resultMixed.matches[2].flags).toHaveLength(0); // Glycerin should not be flagged
});

test('avoid_others flag only affects surfactants', () => {
  const testDatabase = {
    ingredients: {
      'dimethicone': {
        id: 'dimethicone',
        name: 'Dimethicone',
        categories: ['silicones'],
        groups: []
      }
    },
    categories: {
      'silicones': { id: 'silicones', name: 'Silicones' },
      'mild_detergents': { id: 'mild_detergents', name: 'Mild Detergents' }
    },
    groups: {}
  };

  const testSystems = [{
    name: "Test System",
    id: "test_system",
    description: "Test system",
    settings: ["mild_detergents_only"]
  }];

  const analyzer = new Analyzer({
    database: testDatabase,
    systems: testSystems,
    settings: testSettings
  });

  // Test with a non-surfactant ingredient
  const result = analyzer.analyze('Dimethicone', 'test_system');
  expect(result.matches[0].flags).toHaveLength(0);
});
