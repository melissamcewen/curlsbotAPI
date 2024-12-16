import { test, expect } from 'vitest';
import { getFlags } from '../src/utils/flagging';
import type {
  Settings,
  System,
  AnalyzerOptions,
  IngredientDatabase,
} from '../src/types';

// Test database
const testDatabase: IngredientDatabase = {
  ingredients: {
    'test-ingredient': {
      id: 'test-ingredient',
      name: 'Test Ingredient',
      categories: ['test-category'],
    },
  },
  categories: {
    'test-category': {
      id: 'test-category',
      name: 'Test Category',
      group: 'test-group',
    },
    'allowed-category': {
      id: 'allowed-category',
      name: 'Allowed Category',
      group: 'test-group',
    },
  },
  groups: {
    'test-group': {
      id: 'test-group',
      name: 'Test Group',
    },
  },
};

// Test settings
const testSettings: Settings = {
  'test-setting': {
    id: 'test-setting',
    name: 'Test Setting',
    description: 'Test Description',
    ingredients: ['test-ingredient'],
    flags: ['caution'],
  },
  'category-setting': {
    id: 'category-setting',
    name: 'Category Setting',
    description: 'Category Description',
    categories: ['test-category'],
    flags: ['caution'],
  },
  'avoid-others-setting': {
    id: 'avoid-others-setting',
    name: 'Avoid Others Setting',
    description: 'Avoid Others Description',
    categories: ['allowed-category'],
    flags: ['avoid_others_in_category'],
  },
};

// Test system
const testSystem: System = {
  id: 'test-system',
  name: 'Test System',
  settings: ['test-setting', 'category-setting', 'avoid-others-setting'],
};

test('flags ingredient when it is in flaggedIngredients', () => {
  const mergedFlags: AnalyzerOptions = {
    flaggedIngredients: ['test-ingredient'],
  };

  const flags = getFlags(
    'test ingredient',
    testDatabase.ingredients['test-ingredient'],
    ['test-category'],
    ['test-group'],
    testSystem,
    testSettings,
    mergedFlags,
    testDatabase,
  );

  expect(Object.values(flags)).toContainEqual(
    expect.objectContaining({
      id: 'test-setting',
      type: 'ingredient',
      flag_type: 'caution',
    }),
  );
});

test('flags category when it is in flaggedCategories', () => {
  const mergedFlags: AnalyzerOptions = {
    flaggedCategories: ['test-category'],
  };

  const flags = getFlags(
    'test ingredient',
    testDatabase.ingredients['test-ingredient'],
    ['test-category'],
    ['test-group'],
    testSystem,
    testSettings,
    mergedFlags,
    testDatabase,
  );

  expect(Object.values(flags)).toContainEqual(
    expect.objectContaining({
      id: 'category-setting',
      type: 'category',
      flag_type: 'caution',
    }),
  );
});

test('flags group when it is in flaggedGroups', () => {
  const mergedFlags: AnalyzerOptions = {
    flaggedGroups: ['test-group'],
  };

  const flags = getFlags(
    'test ingredient',
    testDatabase.ingredients['test-ingredient'],
    ['test-category'],
    ['test-group'],
    testSystem,
    testSettings,
    mergedFlags,
    testDatabase,
  );

  expect(Object.values(flags)).toContainEqual(
    expect.objectContaining({
      type: 'group',
      flag_type: 'caution',
    }),
  );
});

test('adds avoid_others_in_category flag when ingredient category is in same group but not allowed', () => {
  const flags = getFlags(
    'test ingredient',
    testDatabase.ingredients['test-ingredient'],
    ['test-category'],
    ['test-group'],
    testSystem,
    testSettings,
    {},
    testDatabase,
  );

  expect(Object.values(flags)).toContainEqual(
    expect.objectContaining({
      id: 'avoid-others-setting',
      type: 'category',
      flag_type: 'avoid_others_in_category',
    }),
  );
});

test('does not add avoid_others_in_category flag when ingredient category is allowed', () => {
  const flags = getFlags(
    'allowed ingredient',
    { id: 'allowed-ingredient', categories: ['allowed-category'] },
    ['allowed-category'],
    ['test-group'],
    testSystem,
    testSettings,
    {},
    testDatabase,
  );

  expect(Object.values(flags)).not.toContainEqual(
    expect.objectContaining({
      id: 'avoid-others-setting',
      type: 'category',
      flag_type: 'avoid_others_in_category',
    }),
  );
});

test('returns empty flags when no flags apply', () => {
  const flags = getFlags(
    'random ingredient',
    { id: 'random-ingredient', categories: [] },
    [],
    [],
    testSystem,
    testSettings,
    {},
    testDatabase,
  );

  expect(Object.values(flags)).toHaveLength(0);
});

test('handles undefined system gracefully', () => {
  const flags = getFlags(
    'test ingredient',
    testDatabase.ingredients['test-ingredient'],
    ['test-category'],
    ['test-group'],
    undefined,
    testSettings,
    {},
    testDatabase,
  );

  expect(Object.values(flags)).toHaveLength(0);
});

test('handles undefined database gracefully', () => {
  const flags = getFlags(
    'test ingredient',
    testDatabase.ingredients['test-ingredient'],
    ['test-category'],
    ['test-group'],
    testSystem,
    testSettings,
    {},
    undefined,
  );

  expect(Object.values(flags)).not.toContainEqual(
    expect.objectContaining({
      type: 'category',
      flag_type: 'avoid_others_in_category',
    }),
  );
});
