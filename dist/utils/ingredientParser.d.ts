import { IngredientMatch } from '../types';
export declare function normalizeIngredientName(name: string): string;
export declare function parseIngredientList(ingredientString: string): string[];
export declare function matchIngredient(ingredientName: string): IngredientMatch;
