import type {
  Settings,
  Setting,
  Flag,
  AnalysisResult,
  System,
  Flags,
  IngredientMatch,
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
): AnalysisResult {
  const getSettingsFromIds = (ids: string[]): Setting[] => {
    return ids
      .map((id) => settings[id])
      .filter((setting): setting is Setting => setting !== undefined);
  };

  return getSettingsFromIds(system.settings).reduce(
    (result, setting) => processFlags(setting.flags, result),
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
): AnalysisResult {
  return flags
    .filter((flag) => shouldProcessFlag(flag, analysisResult))
    .reduce((result, flag) => processFlag(flag, result), analysisResult);
}

/**
 * Determines if a flag should be processed based on its type and the analysis result
 * - For group flags: checks if the group exists in the result
 * - For category flags: checks if the category exists in the result
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
        const categoryGroup = analysisResult.categories
          .find(category => category === preferredCategory);

        if (categoryGroup && match.groups?.includes('detergents')) {
          if (!match.categories?.includes(preferredCategory)) {
            shouldFail = true;
            return {
              ...match,
              flags: [...(match.flags || []), flag],
            };
          }
        }
      }
    }

    // For group flags
    if (flag.type === 'group' && match.groups?.includes(flag.id)) {
      // For caution flags
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
