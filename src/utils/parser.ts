export function parseIngredientList(ingredientString: string): string[] {
  return ingredientString
    .split(',')
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0);
}