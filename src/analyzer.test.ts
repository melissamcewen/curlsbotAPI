import { test, expect } from 'vitest';
import { Analyzer } from './analyzer';

test('user preferences should correctly flag items', () => {
  const analyzer = new Analyzer();

  // Set up some test preferences
  analyzer.setUserPreferences({
    rules: [
      {
        id: 'dairy',
        name: 'Dairy',
        type: 'category',
        severity: 'error'
      },
      {
        id: 'milk',
        name: 'Milk',
        type: 'ingredient',
        severity: 'error'
      }
    ]
  });

  // Verify preferences were set correctly
  const options = analyzer.getOptions();
  expect(options?.flaggedCategories).toContain('dairy');
  expect(options?.flaggedIngredients).toContain('milk');

  // Test analysis with flagged items
  const result = analyzer.analyze('milk, water');
  expect(result.matches[0].flags).toContain('milk');
});

test('getAvailableRules should return all possible rules', () => {
  const analyzer = new Analyzer();
  const rules = analyzer.getAvailableRules();

  // Verify we have rules of each type
  expect(rules.some(r => r.type === 'ingredient')).toBe(true);
  expect(rules.some(r => r.type === 'category')).toBe(true);
  expect(rules.some(r => r.type === 'group')).toBe(true);

  // Verify rule structure
  const sampleRule = rules[0];
  expect(sampleRule).toHaveProperty('id');
  expect(sampleRule).toHaveProperty('name');
  expect(sampleRule).toHaveProperty('type');
});
