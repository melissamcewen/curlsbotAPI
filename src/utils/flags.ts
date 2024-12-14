import type { AnalyzerOptions, System } from '../types';

/**
 * Gets system-specific flags based on settings
 */
export function getSystemFlags(system: System | undefined): AnalyzerOptions {
  const flags: Required<AnalyzerOptions> = {
    flaggedIngredients: [],
    flaggedCategories: [],
    flaggedGroups: []
  };

  if (!system) return flags;

  // Apply settings-based flags
  system.settings.forEach(setting => {
    // For now, we'll just handle sulfate_free as an example
    // This should be expanded based on settings.json
    if (setting === 'sulfate_free') {
      flags.flaggedCategories.push('sulfates');
    }
    // Add more settings handling here
  });

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
