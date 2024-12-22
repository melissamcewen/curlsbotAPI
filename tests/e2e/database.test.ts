import { defaultDatabase, defaultSystems, defaultSettings } from '../../src/data/bundledData';
import type { Ingredient, Category, Group, Reference } from '../../src/types';


/* THESE ARE PRODUCTION TESTS USE THE DATA IN src/data/bundledData.ts */

describe('Production Database E2E Tests', () => {
  describe('Data Loading', () => {
    it('should load and validate the production database', () => {
      // Verify database structure
      expect(defaultDatabase).toBeDefined();
      expect(defaultDatabase.ingredients).toBeDefined();
      expect(defaultDatabase.categories).toBeDefined();
      expect(defaultDatabase.groups).toBeDefined();

      // Verify data types
      expect(typeof defaultDatabase.ingredients).toBe('object');
      expect(typeof defaultDatabase.categories).toBe('object');
      expect(typeof defaultDatabase.groups).toBe('object');
    });

    it('should have valid relationships between all data', () => {
      const warnings: string[] = [];

      // Check that all ingredient categories exist and are valid
      Object.entries(defaultDatabase.ingredients).forEach(([id, ingredient]: [string, Ingredient]) => {
        expect(id).toBe(ingredient.id); // ID should match the key
        expect(Array.isArray(ingredient.categories)).toBe(true);
        ingredient.categories.forEach((categoryId: string) => {
          const category = defaultDatabase.categories[categoryId];
          if (!category) {
            warnings.push(`Warning: Category "${categoryId}" referenced by ingredient "${ingredient.name}" does not exist`);
          }
        });
      });

      // Check that all category groups exist and are valid
      Object.entries(defaultDatabase.categories).forEach(([id, category]: [string, Category]) => {
        expect(id).toBe(category.id); // ID should match the key
        const group = defaultDatabase.groups[category.group];
        if (!group) {
          warnings.push(`Warning: Group "${category.group}" referenced by category "${category.name}" does not exist`);
        }
      });

      // Log warnings if any
      if (warnings.length > 0) {
        console.warn('Relationship warnings:');
        warnings.forEach(warning => console.warn(warning));
      }
    });

    it('should have required fields for all data', () => {
      // Check ingredients
      Object.values(defaultDatabase.ingredients).forEach((ingredient: Ingredient) => {
        expect(ingredient.id).toBeDefined();
        expect(ingredient.name).toBeDefined();
        expect(Array.isArray(ingredient.categories)).toBe(true);
      });

      // Check categories
      Object.values(defaultDatabase.categories).forEach((category: Category) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.group).toBeDefined();
      });

      // Check groups
      Object.values(defaultDatabase.groups).forEach((group: Group) => {
        expect(group.id).toBeDefined();
        expect(group.name).toBeDefined();
        // Description is optional for groups
      });
    });
  });

  describe('System and Settings Relationships', () => {
    it('should have valid settings for all systems', () => {
      const warnings: string[] = [];

      // Check that all system settings exist
      defaultSystems.forEach(system => {
        system.settings.forEach(settingId => {
          if (!defaultSettings[settingId]) {
            warnings.push(`System "${system.name}" references setting "${settingId}" which does not exist in defaultSettings`);
          }
        });
      });

      // Check that settings reference valid categories and groups
      Object.entries(defaultSettings).forEach(([settingId, setting]) => {
        // Check categories
        setting.categories?.forEach(categoryId => {
          if (!defaultDatabase.categories[categoryId]) {
            warnings.push(`Setting "${setting.name}" (${settingId}) references category "${categoryId}" which does not exist in the database`);
          }
        });

        // Check groups
        setting.groups?.forEach(groupId => {
          if (!defaultDatabase.groups[groupId]) {
            warnings.push(`Setting "${setting.name}" (${settingId}) references group "${groupId}" which does not exist in the database`);
          }
        });

        // Check allowed categories
        setting.allowedCategories?.forEach(categoryId => {
          if (!defaultDatabase.categories[categoryId]) {
            warnings.push(`Setting "${setting.name}" (${settingId}) has allowed category "${categoryId}" which does not exist in the database`);
          }
        });
      });

      // Log warnings if any
      if (warnings.length > 0) {
        console.warn('System and Settings relationship warnings:');
        warnings.forEach(warning => console.warn(warning));
      }

      expect(warnings).toHaveLength(0);
    });
  });

  describe('Default Ingredients Validation', () => {
    it('should have all defaultIngredients defined in the ingredients database', () => {
      const warnings: string[] = [];

      // Check categories with defaultIngredient
      Object.entries(defaultDatabase.categories).forEach(([id, category]) => {
        if (category.defaultIngredient && !defaultDatabase.ingredients[category.defaultIngredient]) {
          warnings.push(`Category "${category.name}" has defaultIngredient "${category.defaultIngredient}" that does not exist in ingredients database`);
        }
      });

      // Check groups with defaultIngredient
      Object.entries(defaultDatabase.groups).forEach(([id, group]) => {
        if (group.defaultIngredient && !defaultDatabase.ingredients[group.defaultIngredient]) {
          warnings.push(`Group "${group.name}" has defaultIngredient "${group.defaultIngredient}" that does not exist in ingredients database`);
        }
      });

      // Log warnings if any
      if (warnings.length > 0) {
        console.warn('Default Ingredient warnings:');
        warnings.forEach(warning => console.warn(warning));
      }

      expect(warnings).toHaveLength(0);
    });
  });

  describe('ID Format Validation', () => {
    it('should have correctly formatted IDs (lowercase, no hyphens)', () => {
      const warnings: string[] = [];
      const idFormatRegex = /^[a-z0-9_]+$/;  // Only lowercase letters, numbers, and underscores

      // Check ingredient IDs
      Object.entries(defaultDatabase.ingredients).forEach(([id, ingredient]) => {
        if (!idFormatRegex.test(id) || id !== ingredient.id) {
          warnings.push(`Invalid ingredient ID format: "${id}" (${ingredient.name})`);
        }
      });

      // Check category IDs
      Object.entries(defaultDatabase.categories).forEach(([id, category]) => {
        if (!idFormatRegex.test(id) || id !== category.id) {
          warnings.push(`Invalid category ID format: "${id}" (${category.name})`);
        }
      });

      // Check group IDs
      Object.entries(defaultDatabase.groups).forEach(([id, group]) => {
        if (!idFormatRegex.test(id) || id !== group.id) {
          warnings.push(`Invalid group ID format: "${id}" (${group.name})`);
        }
      });

      // Check system IDs
      defaultSystems.forEach(system => {
        if (!idFormatRegex.test(system.id)) {
          warnings.push(`Invalid system ID format: "${system.id}" (${system.name})`);
        }
      });

      // Check setting IDs
      Object.entries(defaultSettings).forEach(([id, setting]) => {
        if (!idFormatRegex.test(id) || id !== setting.id) {
          warnings.push(`Invalid setting ID format: "${id}" (${setting.name})`);
        }
      });

      // Log warnings if any
      if (warnings.length > 0) {
        console.warn('ID format warnings:');
        warnings.forEach(warning => console.warn(warning));
      }

      expect(warnings).toHaveLength(0);
    });
  });

  describe('Reference Validation', () => {
    it('should have properly typed references for all ingredients', () => {
      const warnings: string[] = [];

      Object.entries(defaultDatabase.ingredients).forEach(([id, ingredient]) => {
        if (ingredient.references) {
          ingredient.references.forEach((reference: Reference, index) => {
            // Check required url field
            if (!reference.url) {
              warnings.push(`Ingredient "${ingredient.name}" (${id}) reference #${index + 1} is missing required 'url' field`);
            }

            // Check that only allowed fields are present
            const allowedFields = ['url', 'title', 'description'];
            Object.keys(reference).forEach(field => {
              if (!allowedFields.includes(field)) {
                warnings.push(`Ingredient "${ingredient.name}" (${id}) reference #${index + 1} has invalid field '${field}'`);
              }
            });

            // Check field types
            if (reference.url && typeof reference.url !== 'string') {
              warnings.push(`Ingredient "${ingredient.name}" (${id}) reference #${index + 1} 'url' must be a string`);
            }
            if (reference.title && typeof reference.title !== 'string') {
              warnings.push(`Ingredient "${ingredient.name}" (${id}) reference #${index + 1} 'title' must be a string`);
            }
            if (reference.description && typeof reference.description !== 'string') {
              warnings.push(`Ingredient "${ingredient.name}" (${id}) reference #${index + 1} 'description' must be a string`);
            }
          });
        }
      });

      // Log warnings if any
      if (warnings.length > 0) {
        console.warn('Reference validation warnings:');
        warnings.forEach(warning => console.warn(warning));
      }

      expect(warnings).toHaveLength(0);
    });
  });
});
