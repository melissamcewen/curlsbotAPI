/**
 * Represents a normalized ingredient list that has been validated and cleaned
 * @interface NormalizedIngredientList
 */
export interface NormalizedIngredientList {
  /** List of cleaned and validated ingredients */
  readonly ingredients: readonly string[];
  /** Whether the ingredient list is valid */
  readonly isValid: boolean;
}

export * from './analyzer';
export * from './ingredient';
export * from './matcher';
export * from './category';


