"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIngredient = addIngredient;
exports.removeIngredient = removeIngredient;
exports.normalizeIngredientName = normalizeIngredientName;
exports.parseIngredientList = parseIngredientList;
exports.matchIngredient = matchIngredient;
exports.resetIngredients = resetIngredients;
// In-memory store for ingredients
let ingredients = {};
// Function to add or update an ingredient
function addIngredient(name, details) {
    ingredients[normalizeIngredientName(name)] = { name, ...details };
}
// Function to remove an ingredient
function removeIngredient(name) {
    const normalizedName = normalizeIngredientName(name);
    if (ingredients[normalizedName]) {
        delete ingredients[normalizedName];
        return true;
    }
    return false;
}
// Function to normalize ingredient names
function normalizeIngredientName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ');
}
// Function to parse an ingredient list
function parseIngredientList(ingredientString) {
    return ingredientString
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);
}
// Function to match an ingredient
function matchIngredient(ingredientName) {
    const normalized = normalizeIngredientName(ingredientName);
    const match = Object.entries(ingredients).find(([key]) => normalized.includes(key));
    if (match) {
        return {
            matched: true,
            name: match[1].name,
            normalized: normalizeIngredientName(ingredientName),
            details: {
                name: match[1].name,
                description: match[1].description,
                category: match[1].category,
                notes: match[1].notes,
                source: match[1].source,
                synonyms: match[1].synonyms
            }
        };
    }
    return {
        matched: false,
        name: ingredientName,
        normalized: normalizeIngredientName(ingredientName)
    };
}
// Optional: Reset ingredients (useful for tests or resets)
function resetIngredients() {
    ingredients = {};
}
