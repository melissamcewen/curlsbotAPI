"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIngredientName = normalizeIngredientName;
exports.parseIngredientList = parseIngredientList;
exports.matchIngredient = matchIngredient;
function normalizeIngredientName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ');
}
function parseIngredientList(ingredientString) {
    return ingredientString
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);
}
function matchIngredient(ingredientName) {
    const normalized = normalizeIngredientName(ingredientName);
    const match = Object.entries(ingredients).find(([key]) => normalized.includes(normalizeIngredientName(key)));
    if (match) {
        return {
            matched: true,
            name: match[1].name,
            details: match[1]
        };
    }
    return {
        matched: false,
        name: ingredientName
    };
}
