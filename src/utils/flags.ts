import type { AnalyzerOptions, System } from '../types';
import { getSettingFlags } from './configLoader';

interface FlagOptions {
  configDir?: string;
}

/**
 * Gets system-specific flags based on settings
 */
export function getSystemFlags(system: System | undefined, options: FlagOptions = {}): Required<AnalyzerOptions> {
  const flags: Required<AnalyzerOptions> = {
    flaggedIngredients: [],
    flaggedCategories: [],
    flaggedGroups: []
  };

  if (!system) return flags;

  // Apply settings-based flags
  system.settings.forEach(settingId => {
    const settingFlags = getSettingFlags(settingId, options);
    flags.flaggedIngredients.push(...settingFlags.ingredients);
    flags.flaggedCategories.push(...settingFlags.categories);
    flags.flaggedGroups.push(...settingFlags.flags);
  });

  // Remove duplicates
  flags.flaggedIngredients = [...new Set(flags.flaggedIngredients)];
  flags.flaggedCategories = [...new Set(flags.flaggedCategories)];
  flags.flaggedGroups = [...new Set(flags.flaggedGroups)];

  return flags;
}

/**
 * Merges multiple flag sources into a single set of flags
 */
export function mergeFlags(...flagSources: AnalyzerOptions[]): Required<AnalyzerOptions> {
  const merged: Required<AnalyzerOptions> = {
    flaggedIngredients: [],
    flaggedCategories: [],
    flaggedGroups: []
  };

  flagSources.forEach(source => {
    if (source.flaggedIngredients) {
      merged.flaggedIngredients.push(...source.flaggedIngredients);
    }
    if (source.flaggedCategories) {
      merged.flaggedCategories.push(...source.flaggedCategories);
    }
    if (source.flaggedGroups) {
      merged.flaggedGroups.push(...source.flaggedGroups);
    }
  });

  // Remove duplicates
  merged.flaggedIngredients = [...new Set(merged.flaggedIngredients)];
  merged.flaggedCategories = [...new Set(merged.flaggedCategories)];
  merged.flaggedGroups = [...new Set(merged.flaggedGroups)];

  return merged;
}
