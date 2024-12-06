import { IngredientMatch } from '../types';
export declare function addIngredient(name: string, details: {
    [key: string]: any;
}): void;
export declare function removeIngredient(name: string): boolean;
export declare function normalizeIngredientName(name: string): string;
export declare function parseIngredientList(ingredientString: string): string[];
export declare function matchIngredient(ingredientName: string): IngredientMatch;
export declare function resetIngredients(): void;
