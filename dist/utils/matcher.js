"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchIngredient = matchIngredient;
const ingredients_1 = require("../data/ingredients");
const normalizer_1 = require("./normalizer");
function matchIngredient(ingredientName) {
    const normalized = (0, normalizer_1.normalizeIngredientName)(ingredientName);
    const match = Object.entries(ingredients_1.ingredients).find(([key]) => normalized.includes((0, normalizer_1.normalizeIngredientName)(key)));
    if (match) {
        return {
            name: ingredientName,
            normalized,
            matched: true,
            details: match[1],
            categories: match[1].category
        };
    }
    return {
        name: ingredientName,
        normalized,
        matched: false
    };
}
