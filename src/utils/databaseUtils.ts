import type {
  IngredientDatabase,
  IngredientMatch,
  Ingredient,
  Categories,
  Groups,
  Group,
  System,
} from '../types';

/**
 * Get all searchable terms for an ingredient (name and synonyms)
 */
export function getIngredientTerms(ingredient: Ingredient): string[] {
  return ingredient.synonyms
    ? [ingredient.name, ...ingredient.synonyms]
    : [ingredient.name];
}

/**
 * Find an ingredient by name or synonym in the database
 * Returns both the ingredient and how it was matched
 */
export function findIngredient(
  database: IngredientDatabase,
  searchTerm: string,
): IngredientMatch {
  const normalizedSearchTerm = searchTerm.toLowerCase();
  console.log('Searching for:', normalizedSearchTerm);

  // First partition the database based on the search term
  console.log('Partitioning database based on search term');
  const { database: partitionedDatabase, defaultIngredient } =
    partitionSearchSpace(database, normalizedSearchTerm);

  // Try to find an exact match in the partitioned database
  for (const ingredient of Object.values(
    partitionedDatabase.ingredients,
  ) as Ingredient[]) {
    const terms = getIngredientTerms(ingredient).map((term) =>
      term.toLowerCase(),
    );

    // Try exact matches first
    if (terms.includes(normalizedSearchTerm)) {
      console.log('Found exact match:', ingredient.name);
      return {
        uuid: crypto.randomUUID(),
        input: searchTerm,
        normalized: normalizedSearchTerm,
        ingredient,
      };
    }
  }

  // If no exact match, try partial matches in the partitioned database
  for (const ingredient of Object.values(
    partitionedDatabase.ingredients,
  ) as Ingredient[]) {
    const terms = getIngredientTerms(ingredient).map((term) =>
      term.toLowerCase(),
    );

    for (const term of terms) {
      if (term.includes('unknown')) continue;
      // Check if the search term contains the full ingredient term
      const words = term.split(' ');
      console.log('term:', term, 'words:', words);
      if (words.length > 1) {
        // For multi-word terms, normalize spaces and check if search term contains the full term
        const normalizedTerm = term.replace(/\s+/g, ' ').trim();
        const normalizedSearchTermSpaces = normalizedSearchTerm
          .replace(/\s+/g, ' ')
          .trim();
        // Check if the normalized search term includes the normalized ingredient term
        if (normalizedSearchTermSpaces.includes(normalizedTerm)) {
          console.log('Found multi-word match:', ingredient.id, 'term:', term);
          return {
            uuid: crypto.randomUUID(),
            input: searchTerm,
            normalized: normalizedSearchTerm,
            ingredient,
          };
        }
      } else {
        // For single-word terms, check if the search term includes the term
        if (normalizedSearchTerm.includes(term)) {
          console.log('Found single-word match:', ingredient.id, 'term:', term);
          return {
            uuid: crypto.randomUUID(),
            input: searchTerm,
            normalized: normalizedSearchTerm,
            ingredient,
          };
        }
      }
    }
  }

  // If no match found, use default ingredient if available
  if (defaultIngredient) {
    console.log('Using default ingredient:', defaultIngredient);
    return {
      uuid: crypto.randomUUID(),
      input: searchTerm,
      normalized: normalizedSearchTerm,
      ingredient: getIngredientById(database, defaultIngredient),
    };
  }

  return {
    uuid: crypto.randomUUID(),
    input: searchTerm,
    normalized: normalizedSearchTerm,
    ingredient: undefined,
  };
}

/**
 * Partition the search space as much as possible and return the partitioned database
 */
export function partitionSearchSpace(
  database: IngredientDatabase,
  searchTerm: string,
): { database: IngredientDatabase; defaultIngredient: string | undefined } {
  const normalizedSearchTerm = searchTerm.toLowerCase();

  const matchingGroup = findGroupByInclusion(
    database.groups,
    normalizedSearchTerm,
  );
  const matchingCategory = findCategoryByInclusion(
    database.categories,
    normalizedSearchTerm,
  );

  if (matchingCategory) {
    return {
      database: filterDatabaseByCategory(database, matchingCategory.categoryId),
      defaultIngredient: matchingCategory.defaultIngredient,
    };
  }

  if (matchingGroup) {
    return {
      database: filterDatabaseByGroup(database, matchingGroup.groupId),
      defaultIngredient: matchingGroup.defaultIngredient,
    };
  }

  return {
    database,
    defaultIngredient: undefined,
  };
}

/**
 * Create a new database containing only elements from the specified group
 */
export function filterDatabaseByGroup(
  database: IngredientDatabase,
  groupId: string,
): IngredientDatabase {
  // Get categories belonging to this group
  const relevantCategories = Object.entries(database.categories)
    .filter(([_, category]) => category.group === groupId)
    .reduce(
      (acc, [categoryId, category]) => ({
        ...acc,
        [categoryId]: category,
      }),
      {},
    );

  // Get ingredients belonging to any of these categories
  const relevantIngredients = Object.entries(database.ingredients)
    .filter(([_, ingredient]) =>
      ingredient.categories?.some((categoryId) =>
        Object.keys(relevantCategories).includes(categoryId),
      ),
    )
    .reduce(
      (acc, [ingredientId, ingredient]) => ({
        ...acc,
        [ingredientId]: ingredient,
      }),
      {},
    );

  return {
    ...database,
    categories: relevantCategories,
    ingredients: relevantIngredients,
  };
}

/**
 * Create a new database containing only elements from the specified category
 */
export function filterDatabaseByCategory(
  database: IngredientDatabase,
  categoryId: string,
): IngredientDatabase {
  const relevantIngredients = Object.entries(database.ingredients)
    .filter(([_, ingredient]) => ingredient.categories?.includes(categoryId))
    .reduce(
      (acc, [ingredientId, ingredient]) => ({
        ...acc,
        [ingredientId]: ingredient,
      }),
      {},
    );

  return {
    categories: {
      [categoryId]: database.categories[categoryId],
    } as Categories,
    ingredients: relevantIngredients,
    groups: {},
  };
}

/**
 * Find first category whose inclusions are contained within the search term
 * @param categories - Object containing all categories, where keys are category IDs
 * @param searchTerm - The term to search for within category inclusions
 * @returns Object containing matched categoryId and its defaultIngredient, or undefined if no match
 *
 * Example:
 * If categories = {
 *   "cat1": {
 *     inclusions: ["sulfate", "sls"],
 *     exclusions: ["free"],
 *     defaultIngredient: "sodium_lauryl_sulfate"
 *   }
 * }
 * and searchTerm = "sulfate free shampoo"
 * It will NOT match because while "sulfate" is in the search term, "free" is in exclusions
 */
export function findCategoryByInclusion(
  categories: Categories,
  searchTerm: string,
): { categoryId: string; defaultIngredient: string | undefined } | undefined {
  // Convert search term to lowercase for case-insensitive matching
  const normalizedSearchTerm = searchTerm.toLowerCase();

  // Look through all categories to find the first one where any of its inclusions
  // are contained within the search term
  const matchedCategory = Object.entries(categories).find(([_, category]) => {
    // First check if any exclusions match - if so, this category should not match
    const hasExclusion = category.exclusions?.some((exclusion) =>
      normalizedSearchTerm.includes(exclusion.toLowerCase()),
    );
    if (hasExclusion) return false;

    // Then check if any inclusions match
    return category.inclusions?.some((inclusion) =>
      normalizedSearchTerm.includes(inclusion.toLowerCase()),
    );
  });

  // If no category was found, return undefined
  if (!matchedCategory) return undefined;

  // Destructure the matched category into its ID and data
  const [categoryId, category] = matchedCategory;

  // Return the category ID and its default ingredient (if any)
  return {
    categoryId,
    defaultIngredient: category.defaultIngredient,
  };
}

/**
 * Find first group whose inclusions are contained within the search term
 * @param groups - Object containing all groups, where keys are group IDs
 * @param searchTerm - The term to search for within group inclusions
 * @returns Object containing matched groupId and its defaultIngredient, or undefined if no match
 *
 * Example:
 * If groups = {
 *   "group1": {
 *     inclusions: ["silicone", "cone"],
 *     exclusions: ["free"],
 *     defaultIngredient: "dimethicone"
 *   }
 * }
 * and searchTerm = "silicone free conditioner"
 * It will NOT match because while "silicone" is in the search term, "free" is in exclusions
 */
export function findGroupByInclusion(
  groups: Groups,
  searchTerm: string,
): { groupId: string; defaultIngredient: string | undefined } | undefined {
  const normalizedSearchTerm = searchTerm.toLowerCase();

  const matchedGroup = Object.entries(groups).find(([_, group]) => {
    // First check if any exclusions match - if so, this group should not match
    const hasExclusion = group.exclusions?.some((exclusion) =>
      normalizedSearchTerm.includes(exclusion.toLowerCase()),
    );
    if (hasExclusion) return false;

    // Then check if any inclusions match
    return group.inclusions?.some((inclusion) =>
      normalizedSearchTerm.includes(inclusion.toLowerCase()),
    );
  });

  if (!matchedGroup) return undefined;

  const [groupId, group] = matchedGroup;
  return {
    groupId,
    defaultIngredient: group.defaultIngredient,
  };
}

/**
 * Find an ingredient by its ID in the database
 */
export function getIngredientById(
  database: IngredientDatabase,
  ingredientId: string,
): Ingredient | undefined {
  return database.ingredients[ingredientId];
}

/**
 * Get unique group IDs for a list of category IDs
 */
export function getCategoryGroups(
  database: IngredientDatabase,
  categoryIds: string[],
): string[] {
  const groups = new Set<string>();

  categoryIds.forEach((categoryId) => {
    const category = database.categories[categoryId];
    if (category) {
      groups.add(category.group);
    }
  });

  return Array.from(groups);
}

/**
 * Find a system by its ID
 */
export function findSystemById(
  systems: System[],
  systemId: string,
): System | undefined {
  return systems.find((system) => system.id === systemId);
}
