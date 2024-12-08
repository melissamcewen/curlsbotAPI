import { alcohols } from './alcohols';
import { cleansers } from './cleansers';
import { silicones } from './silicones';
import { other } from './other';
import type { Ingredient } from '../../../types';

// Flatten all ingredient categories into a single Record<string, Ingredient>
export const testIngredients: Record<string, Ingredient> = Object.entries({
  ...alcohols,
  ...cleansers,
  ...silicones,
  ...other,
}).reduce((acc, [key, value]) => ({
  ...acc,
  [key]: value
}), {});
