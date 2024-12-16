import type {
  Settings,
  Setting,
  Flag,
  AnalysisResult,
  System,
  Flags,
  IngredientMatch,
  IngredientDatabase,
} from '../types';
import { getBundledSettings } from '../data/bundledData';


/**
 * Main flagging function that processes a system's settings and applies them to the analysis result
 * Uses functional composition with reduce to process all settings sequentially
 */
export function flag(
  analysisResult: AnalysisResult,
  system: System,
  settings: Record<string, Setting> = getBundledSettings(),
  database: IngredientDatabase,
): AnalysisResult {
  const getSettingsFromIds = (ids: string[]): Setting[] => {
    return ids
      .map((id) => settings[id])
      .filter((setting): setting is Setting => setting !== undefined);
  };

  return getSettingsFromIds(system.settings).reduce(
    (result, setting) => processFlags(setting.flags, result, database),
    analysisResult,
  );
}

/**
 * Processes an array of flags against an analysis result
 * 1. Filters flags to only those that should be processed
 * 2. Reduces the filtered flags into a final analysis result
 */
export function processFlags(
  flags: Flag[],
  analysisResult: AnalysisResult,
  database: IngredientDatabase,
): AnalysisResult {
  return flags
    .filter((flag) => shouldProcessFlag(flag, analysisResult))
    .reduce((result, flag) => processFlag(flag, result, database), analysisResult);
}

/**
 * Determines if a flag should be processed based on its type and the analysis result
 * - For group flags: checks if the group exists in the result
 * - For category flags: checks if the category exists in the result (except for avoid_others_in_group)
 * - For other flags: always processes them
 */
function shouldProcessFlag(
  flag: Flag,
  analysisResult: AnalysisResult,
): boolean {
  if (flag.type === 'group') {
    return analysisResult.groups.includes(flag.id);
  }
  if (flag.type === 'category') {
    if (flag.flag_type === 'avoid_others_in_group') {
      return true;
    }
    return analysisResult.categories.includes(flag.id);
  }
  return true;
}

/**
 * Processes a single flag against an analysis result
 * 1. Updates matches by adding the flag to any match that includes the flagged category/group
 * 2. Adds the flag to the result's flags collection
 * 3. Updates the status based on the flag type
 */
function processFlag(
  flag: Flag,
  analysisResult: AnalysisResult,
  database: IngredientDatabase,
): AnalysisResult {
  let shouldFail = false;
  const updatedMatches = analysisResult.matches.map((match) => {
    // For regular category flags
    if (flag.type === 'category') {
      if (flag.flag_type === 'avoid' && match.categories?.includes(flag.id)) {
        shouldFail = true;
        return {
          ...match,
          flags: [...(match.flags || []), flag],
        };
      }

      if (flag.flag_type === 'avoid_others_in_group') {
        // If this match is in the same group as our preferred category
        // but doesn't have the preferred category, flag it
        const preferredCategory = flag.id;
        const preferredCategoryGroup = database.categories[preferredCategory]?.group;
        const matchGroups = match.groups || [];
        const matchCategories = match.categories || [];

        // If the match has the same group as the preferred category but doesn't have the preferred category
        if (preferredCategoryGroup && matchGroups.includes(preferredCategoryGroup) && !matchCategories.includes(preferredCategory)) {
          shouldFail = true;
          return {
            ...match,
            flags: [...(match.flags || []), flag],
          };
        }
      }
    }

    // For group flags
    if (flag.type === 'group' && match.groups?.includes(flag.id)) {
      return {
        ...match,
        flags: [...(match.flags || []), flag],
      };
    }

    return match;
  });

  return {
    ...analysisResult,
    matches: updatedMatches,
    flags: [...analysisResult.flags, flag],
    status: shouldFail ? 'fail' : analysisResult.status,
  };
}
