"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeIngredients = analyzeIngredients;
exports.findIngredientsByCategory = findIngredientsByCategory;
const parser_1 = require("./parser");
const matcher_1 = require("./matcher");
const ingredients_1 = require("../data/ingredients");
function analyzeIngredients(ingredientString) {
    const ingredientList = (0, parser_1.parseIngredientList)(ingredientString);
    return ingredientList.map(ingredient => (0, matcher_1.matchIngredient)(ingredient));
}
function findIngredientsByCategory(category) {
    return Object.values(ingredients_1.ingredients)
        .filter(ingredient => ingredient.category.includes(category))
        .map(ingredient => ingredient.name);
}
