"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIngredientName = normalizeIngredientName;
function normalizeIngredientName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ');
}
