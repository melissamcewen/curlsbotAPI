import { testIngredients } from './data/testIngredients';
import { testCategories } from './data/testCategories';

describe('Test Database Validation', () => {
  // Helper function to check if string is in Title Case with special handling for hyphens
  function isTitleCase(str: string): boolean {
    // Split into words, handling hyphens specially
    const words = str.split(' ').map(word => {
      if (word.includes('-')) {
        // For hyphenated words, only first part should be capitalized
        const parts = word.split('-');
        return parts[0].charAt(0) === parts[0].charAt(0).toUpperCase() &&
               parts.slice(1).every(part => part.charAt(0) === part.charAt(0).toLowerCase());
      }
      return word.charAt(0) === word.charAt(0).toUpperCase();
    });

    return words.every(result => result === true);
  }

  // Helper function to generate ID from name
  function generateId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '-');
  }

  // Test that all category names are in correct Title Case
  it('all category names should be in correct Title Case (hyphenated words have subsequent parts in lower case)', () => {
    testCategories.forEach(group => {
      group.categories.forEach(category => {
        expect(isTitleCase(category.name),
          `Category "${category.name}" is not in correct case. ` +
          'First word and words after spaces should be capitalized, ' +
          'but words after hyphens should be lowercase.'
        ).toBe(true);
      });
    });
  });

  // Test that all ingredient names are in Title Case
  it('all ingredient names should be in Title Case', () => {
    testIngredients.forEach(ingredient => {
      expect(isTitleCase(ingredient.name),
        `Ingredient "${ingredient.name}" is not in correct case. ` +
        'First word and words after spaces should be capitalized, ' +
        'but words after hyphens should be lowercase.'
      ).toBe(true);
    });
  });

  // Test that all categories exist in test categories
  it('all ingredients should belong to valid categories', () => {
    // Get all valid category IDs
    const validCategoryIds = new Set<string>();
    testCategories.forEach(group => {
      group.categories.forEach(category => {
        validCategoryIds.add(category.id);
      });
    });

    // Log valid category IDs for debugging
    console.log('Valid category IDs:', Array.from(validCategoryIds));

    testIngredients.forEach(ingredient => {
      ingredient.category.forEach(catId => {
        expect(validCategoryIds.has(catId),
          `Invalid category ID "${catId}" found in ingredient "${ingredient.name}". ` +
          `Valid category IDs are: ${Array.from(validCategoryIds).join(', ')}`
        ).toBe(true);
      });
    });
  });

  // Test for duplicate ingredient names
  it('should not have duplicate ingredient names', () => {
    const allIngredients = new Set<string>();

    testIngredients.forEach(ingredient => {
      const normalizedName = ingredient.name.toLowerCase();
      expect(allIngredients.has(normalizedName),
        `Duplicate ingredient name found: "${ingredient.name}"`
      ).toBe(false);

      allIngredients.add(normalizedName);
    });
  });

  // Test for duplicate IDs and correct ID format
  it('should not have duplicate IDs for category groups, categories, and ingredients, and IDs should be in correct format', () => {
    const allIds = new Set<string>();

    // Check category group IDs
    testCategories.forEach(group => {
      const expectedId = generateId(group.name);
      expect(group.id).toBe(expectedId);
      expect(allIds.has(group.id),
        `Duplicate category group ID found: "${group.id}"`
      ).toBe(false);
      allIds.add(group.id);

      // Check category IDs
      group.categories.forEach(category => {
        const expectedId = generateId(category.name);
        expect(category.id).toBe(expectedId);
        expect(allIds.has(category.id),
          `Duplicate category ID found: "${category.id}"`
        ).toBe(false);
        allIds.add(category.id);
      });
    });

    // Check ingredient IDs
    testIngredients.forEach(ingredient => {
      const expectedId = generateId(ingredient.name);
      expect(ingredient.id).toBe(expectedId);
      expect(allIds.has(ingredient.id),
        `Duplicate ingredient ID found: "${ingredient.id}"`
      ).toBe(false);
      allIds.add(ingredient.id);
    });
  });
});
