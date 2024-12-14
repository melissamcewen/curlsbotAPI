import type {
  IngredientMatch,
  AnalyzerOptions,
  IngredientDatabase,
} from '../types';

export interface FlagResult {
  flags: {
    ingredients: string[];
    categories: string[];
    Groups: string[];
  };
  matchDetails: {
    matched: boolean;
    flagged: boolean;
  };
}

export class Flagger {
  private options: AnalyzerOptions;
  private database: IngredientDatabase;

  constructor(database: IngredientDatabase, options: AnalyzerOptions = {}) {
    this.options = options;
    this.database = database;
  }

  public getFlagsForMatch(match: IngredientMatch): FlagResult {
    const flags = {
      ingredients: [] as string[],
      categories: [] as string[],
      Groups: [] as string[],
    };

    let isFlagged = false;

    // Check ingredient name and aliases against flagged ingredients
    if (this.options.flaggedIngredients?.length) {
      const flaggedIngredients = this.options.flaggedIngredients;

      if (match.details && flaggedIngredients.includes(match.details.id)) {
        flags.ingredients.push(match.details.id);
        isFlagged = true;
      }
    }

    // Check categories
    if (this.options.flaggedCategories?.length && match.categories?.length) {
      const flaggedCategories = this.options.flaggedCategories;

      match.categories.forEach((category) => {
        if (flaggedCategories.includes(category)) {
          flags.categories.push(category);
          isFlagged = true;
        }
      });
    }

    // Check category groups
    if (this.options.flaggedGroups?.length && match.categories?.length) {
      const flaggedGroups = this.options.flaggedGroups;

      // Find which groups the match's categories belong to
      this.database.categories.forEach((group) => {
        if (flaggedGroups.includes(group.id.toLowerCase())) {
          const groupCategories = group.categories.map((c) =>
            c.id.toLowerCase(),
          );

          match.categories?.forEach((matchCategory) => {
            if (groupCategories.includes(matchCategory.toLowerCase())) {
              flags.Groups.push(group.id.toLowerCase());
              isFlagged = true;
            }
          });
        }
      });
    }

    const matchDetails = {
      matched: true,
      flagged: isFlagged,
    };

    return { flags, matchDetails };
  }
}
