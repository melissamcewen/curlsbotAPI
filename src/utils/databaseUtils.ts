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
): IngredientMatch & { partitionedDatabase: IngredientDatabase } {
  const normalizedSearchTerm = searchTerm.toLowerCase();
  const { database: partitionedDatabase, defaultIngredient } =
    partitionSearchSpace(database, normalizedSearchTerm);

  // Find the ingredient in the partitioned database
  for (const ingredient of Object.values(
    partitionedDatabase.ingredients,
  ) as Ingredient[]) {
    const terms = getIngredientTerms(ingredient).map((term) =>
      term.toLowerCase(),
    );
    if (terms.includes(normalizedSearchTerm)) {
      return {
        uuid: crypto.randomUUID(),
        input: searchTerm,
        normalized: normalizedSearchTerm,
        ingredient,
        partitionedDatabase,
      };
    }
  }

  if (defaultIngredient) {
    return {
      uuid: crypto.randomUUID(),
      input: searchTerm,
      normalized: normalizedSearchTerm,
      ingredient: getIngredientById(database, defaultIngredient),
      partitionedDatabase,
    };
  }

  return {
    uuid: crypto.randomUUID(),
    input: searchTerm,
    normalized: normalizedSearchTerm,
    ingredient: undefined,
    partitionedDatabase,
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
 */
export function findCategoryByInclusion(
  categories: Categories,
  searchTerm: string,
): { categoryId: string; defaultIngredient: string | undefined } | undefined {
  const normalizedSearchTerm = searchTerm.toLowerCase();

  const matchedCategory = Object.entries(categories).find(([_, category]) =>
    category.inclusions?.some((inclusion) =>
      normalizedSearchTerm.includes(inclusion.toLowerCase()),
    ),
  );

  if (!matchedCategory) return undefined;

  const [categoryId, category] = matchedCategory;
  return {
    categoryId,
    defaultIngredient: category.defaultIngredient,
  };
}
/**
 * Find first group whose inclusions are contained within the search term
 */
export function findGroupByInclusion(
  groups: Groups,
  searchTerm: string,
): { groupId: string; defaultIngredient: string | undefined } | undefined {
  const normalizedSearchTerm = searchTerm.toLowerCase();

  const matchedGroup = Object.entries(groups).find(([_, group]) =>
    group.inclusions?.some((inclusion) =>
      normalizedSearchTerm.includes(inclusion.toLowerCase()),
    ),
  );

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
