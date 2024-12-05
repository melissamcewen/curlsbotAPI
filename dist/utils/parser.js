"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIngredientList = parseIngredientList;
function parseIngredientList(ingredientString) {
    return ingredientString
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);
}
