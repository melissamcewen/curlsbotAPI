import type {
  IngredientMatch,
  AnalyzerOptions,
  IngredientDatabase
} from '../types';

export class Flagger {
  private options: AnalyzerOptions;
  private database: IngredientDatabase;

  constructor(database: IngredientDatabase, options: AnalyzerOptions = {}) {
    this.options = options;
    this.database = database;
  }

  public getFlagsForMatch(match: IngredientMatch) {
    const flags = {
      ingredients: [] as string[],
      categories: [] as string[],
      categoryGroups: [] as string[],
    };

    let isFlagged = false;

    // Check ingredient name and aliases against flagged ingredients
    if (this.options.flaggedIngredients?.length) {
      const normalizedFlaggedIngredients = this.options.flaggedIngredients.map(i =>
        i.toLowerCase()
      );

      if (normalizedFlaggedIngredients.includes(match.normalized)) {
        flags.ingredients.push(match.normalized);
        isFlagged = true;
      }

      // Check synonyms if they exist
      if (match.details?.synonyms) {
        match.details.synonyms.forEach(synonym => {
          if (normalizedFlaggedIngredients.includes(synonym.toLowerCase())) {
            flags.ingredients.push(synonym);
            isFlagged = true;
          }
        });
      }
    }

    // Check categories
    if (this.options.flaggedCategories?.length && match.categories?.length) {
      const normalizedFlaggedCategories = this.options.flaggedCategories.map(c =>
        c.toLowerCase()
      );

      match.categories.forEach(category => {
        if (normalizedFlaggedCategories.includes(category.toLowerCase())) {
          flags.categories.push(category);
          isFlagged = true;
        }
      });
    }

    // Check category groups
    if (this.options.flaggedCategoryGroups?.length && match.categories?.length) {
      const flaggedGroups = this.options.flaggedCategoryGroups;

      // Find which groups the match's categories belong to
      this.database.categories.forEach(group => {
        if (flaggedGroups.includes(group.name)) {
          const groupCategories = group.categories.map(c =>
            c.name.toLowerCase()
          );

          match.categories?.forEach(matchCategory => {
            if (groupCategories.includes(matchCategory.toLowerCase())) {
              flags.categoryGroups.push(group.name);
              isFlagged = true;
            }
          });
        }
      });
    }

    // Update match details with flagged status
    if (match.matchDetails) {
      match.matchDetails.flagged = isFlagged;
    } else {
      match.matchDetails = {
        matched: true,
        matchTypes: ['exactMatch'],
        searchType: 'ingredient',
        flagged: isFlagged
      };
    }

    return flags;
  }
}
