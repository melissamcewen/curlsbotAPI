import type {
  Settings,
  System,
  AnalyzerOptions,
  Flags,
  IngredientDatabase
} from '../types';

export function getFlags(
  normalizedName: string,
  ingredient: any,
  categories: string[],
  groups: string[],
  system: System | undefined,
  settings: Settings,
  mergedFlags: AnalyzerOptions,
  database?: IngredientDatabase
): Flags {
  const flags: Flags = {};

  // Add ingredient flags
  if (ingredient && mergedFlags.flaggedIngredients?.includes(ingredient.id)) {
    const setting = Object.values(settings).find(s => s.ingredients?.includes(ingredient.id));
    if (setting) {
      flags[setting.id] = {
        id: setting.id,
        name: setting.name,
        description: setting.description,
        type: 'ingredient',
        flag_type: setting.flags?.[0] || 'caution'
      };
    }
  }

  // Add category flags and handle avoid_others_in_category
  categories.forEach(catId => {
    // Check if category is directly flagged
    if (mergedFlags.flaggedCategories?.includes(catId)) {
      const setting = Object.values(settings).find(s => s.categories?.includes(catId));
      if (setting) {
        flags[setting.id] = {
          id: setting.id,
          name: setting.name,
          description: setting.description,
          type: 'category',
          flag_type: setting.flags?.[0] || 'caution'
        };
      }
    }

    // Check system settings
    if (system && database) {
      system.settings.forEach(settingId => {
        const setting = settings[settingId];
        if (setting) {
          if (setting.flags?.includes('avoid_others_in_category')) {
            const settingCategories = setting.categories || [];
            settingCategories.forEach(settingCatId => {
              const settingCategory = database.categories[settingCatId];
              if (settingCategory) {
                const categoryGroup = settingCategory.group;
                const categoriesInGroup = Object.values(database.categories)
                  .filter(cat => cat.group === categoryGroup)
                  .map(cat => cat.id);

                const hasGroupCategories = categories.some(c => categoriesInGroup.includes(c));
                const hasAllowedCategory = categories.some(c => settingCategories.includes(c));

                if (hasGroupCategories && !hasAllowedCategory) {
                  flags[settingId] = {
                    id: settingId,
                    name: setting.name,
                    description: setting.description,
                    type: 'category',
                    flag_type: 'avoid_others_in_category'
                  };
                }
              }
            });
          } else if (categories.some(catId => setting.categories?.includes(catId))) {
            if (setting.flags) {
              setting.flags.forEach(flag => {
                flags[flag] = {
                  type: 'category',
                  flag_type: setting.flags[0],
                  settingId: settingId
                };
              });
            }
          }
        }
      });
    }
  });

  // Check groups for avoid_others_in_category
  if (database) {
    groups.forEach(groupId => {
      system?.settings.forEach(settingId => {
        const setting = settings[settingId];
        if (setting?.flags?.includes('avoid_others_in_category')) {
          const settingCategories = setting.categories || [];
          settingCategories.forEach(settingCatId => {
            const settingCategory = database.categories[settingCatId];
            if (settingCategory && settingCategory.group === groupId && !categories.some(c => settingCategories.includes(c))) {
              flags[settingId] = {
                id: settingId,
                name: setting.name,
                description: setting.description,
                type: 'category',
                flag_type: 'avoid_others_in_category'
              };
            }
          });
        }
      });
    });
  }

  // Add group flags
  groups.forEach(groupId => {
    if (mergedFlags.flaggedGroups?.includes(groupId)) {
      flags[groupId] = {
        type: 'group',
        flag_type: 'caution'
      };
    }
  });

  return flags;
}
