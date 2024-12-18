import { IngredientDatabase, IngredientMatch, Ingredient, Categories, Groups, System } from '../types';
/**
 * Get all searchable terms for an ingredient (name and synonyms)
 */
export declare function getIngredientTerms(ingredient: Ingredient): string[];
/**
 * Find an ingredient by name or synonym in the database
 * Returns both the ingredient and how it was matched
 */
export declare function findIngredient(database: IngredientDatabase, searchTerm: string): IngredientMatch;
/**
 * Partition the search space as much as possible and return the partitioned database
 */
export declare function partitionSearchSpace(database: IngredientDatabase, searchTerm: string): {
    database: IngredientDatabase;
    defaultIngredient: string | undefined;
};
/**
 * Create a new database containing only elements from the specified group
 */
export declare function filterDatabaseByGroup(database: IngredientDatabase, groupId: string): IngredientDatabase;
/**
 * Create a new database containing only elements from the specified category
 */
export declare function filterDatabaseByCategory(database: IngredientDatabase, categoryId: string): IngredientDatabase;
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
export declare function findCategoryByInclusion(categories: Categories, searchTerm: string): {
    categoryId: string;
    defaultIngredient: string | undefined;
} | undefined;
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
export declare function findGroupByInclusion(groups: Groups, searchTerm: string): {
    groupId: string;
    defaultIngredient: string | undefined;
} | undefined;
/**
 * Find an ingredient by its ID in the database
 */
export declare function getIngredientById(database: IngredientDatabase, ingredientId: string): Ingredient | undefined;
/**
 * Get unique group IDs for a list of category IDs
 */
export declare function getCategoryGroups(database: IngredientDatabase, categoryIds: string[]): string[];
/**
 * Find a system by its ID
 */
export declare function findSystemById(systems: System[], systemId: string): System | undefined;
//# sourceMappingURL=databaseUtils.d.ts.map