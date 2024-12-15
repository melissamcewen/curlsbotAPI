import type { IngredientDatabase } from '../types';

import { loadSettings, loadSystems } from './configLoader';

export function validateSettingsAndSystems(database: IngredientDatabase, configDir: string): string[] {
  const errors: string[] = [];
  const settings = loadSettings({ configDir });
  const systems = loadSystems({ configDir });

  // Validate that all settings referenced by systems exist
  systems.forEach(system => {
    if (system.settings) {
      system.settings.forEach(settingId => {
        if (!settings[settingId]) {
          errors.push(`❌ Invalid setting "${settingId}" referenced by system "${system.name}"`);
        }
      });
    }
  });

  // Validate that all ingredient IDs referenced in settings exist
  Object.values(settings).forEach(setting => {
    if (setting.ingredients) {
      setting.ingredients.forEach(ingredientId => {
        if (!database.ingredients[ingredientId]) {
          errors.push(`❌ Invalid ingredient "${ingredientId}" referenced by setting "${setting.name}"`);
        }
      });
    }
  });

  // Validate that all category IDs referenced in settings exist
  Object.values(settings).forEach(setting => {
    if (setting.categories) {
      setting.categories.forEach(categoryId => {
        if (!database.categories[categoryId]) {
          errors.push(`❌ Invalid category "${categoryId}" referenced by setting "${setting.name}"`);
        }
      });
    }
  });

  return errors;
}
