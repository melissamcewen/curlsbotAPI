import type { Setting, Flag, System, Settings } from '../types';

/**
 * Creates a flag record for a given setting and flag ID
 */
export function createFlag(settingId: string, setting: Setting, type: 'ingredient' | 'category' | 'group'): Flag {
  return {
    id: settingId,
    name: setting.name,
    description: setting.description,
    type,
    flag_type: setting.flags[0] as 'avoid' | 'prefer' | 'avoid_others_in_category' | 'caution'
  };
}

/**
 * Gets flags for an ingredient based on its categories and groups
 */
export function getFlags(
  normalizedName: string,
  ingredient: { id: string } | undefined,
  categories: string[],
  groups: string[],
  system: System | undefined,
  settings: Settings,
  mergedFlags: {
    flaggedIngredients?: string[];
    flaggedCategories?: string[];
    flaggedGroups?: string[];
  }
): string[] {
  const flags = new Set<string>();

  // Add ingredient flags
  if (ingredient && mergedFlags.flaggedIngredients?.includes(ingredient.id)) {
    console.log(`Adding ingredient flag ${ingredient.id} for ${normalizedName}`);
    flags.add(ingredient.id);
  }

  // Add category flags
  categories.forEach(catId => {
    if (mergedFlags.flaggedCategories?.includes(catId)) {
      console.log(`Adding category flag ${catId} for ${normalizedName}`);
      flags.add(catId);
    }

    // Check settings that apply to this category
    if (system) {
      system.settings.forEach(settingId => {
        const setting = settings[settingId];
        if (setting?.categories?.includes(catId)) {
          if (setting.flags) {
            setting.flags.forEach(flag => flags.add(settingId));
          }
        }
      });
    }
  });

  // Add group flags
  groups.forEach(groupId => {
    if (mergedFlags.flaggedGroups?.includes(groupId)) {
      console.log(`Adding group flag ${groupId} for ${normalizedName}`);
      flags.add(groupId);
    }
  });

  return Array.from(flags);
}

/**
 * Checks if an ingredient's categories are in a group that has avoid_others_in_category
 */
export function checkAvoidOthersInCategory(
  normalizedName: string,
  categories: string[],
  groups: string[],
  system: System | undefined,
  settings: Settings,
  databaseCategories: Record<string, { group: string }>
): string[] {
  const flags = new Set<string>();

  groups.forEach(groupId => {
    system?.settings.forEach(settingId => {
      const setting = settings[settingId];
      if (setting?.flags?.includes('avoid_others_in_category')) {
        const settingCategories = setting.categories || [];
        settingCategories.forEach(settingCatId => {
          const settingCategory = databaseCategories[settingCatId];
          if (settingCategory && settingCategory.group === groupId && !categories.some(c => settingCategories.includes(c))) {
            console.log(`Adding avoid_others_in_category flag ${settingId} for ${normalizedName} from group check`);
            flags.add(settingId);
          }
        });
      }
    });
  });

  return Array.from(flags);
}
