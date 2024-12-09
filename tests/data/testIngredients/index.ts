import type { Ingredient } from '../../../src/types';

import { alcohols } from './alcohols';
import { cleansers } from './cleansers';
import { silicones } from './silicones';
import { other } from './other';



export const testIngredients: Ingredient[] = [
  ...alcohols,
  ...cleansers,
  ...silicones,
  ...other,
];
