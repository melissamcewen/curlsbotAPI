"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatcher = createMatcher;
const fuse_js_1 = __importDefault(require("fuse.js"));
const normalizer_1 = require("./normalizer");
function createMatcher(config) {
    const { ingredients } = config.database;
    // Create a searchable array of ingredients with their synonyms
    const ingredientsList = Object.entries(ingredients).flatMap(([key, value]) => {
        const mainEntry = {
            key,
            ...value,
            isSynonym: false
        };
        const synonymEntries = (value.synonyms || []).map(synonym => ({
            key: synonym.toLowerCase(),
            ...value,
            isSynonym: true,
            originalKey: key
        }));
        return [mainEntry, ...synonymEntries];
    });
    // Configure Fuse.js options
    const fuseOptions = {
        keys: ['key', 'name', 'synonyms'],
        threshold: config.fuzzyMatchThreshold || 0.3,
        includeScore: true
    };
    const fuse = new fuse_js_1.default(ingredientsList, fuseOptions);
    return function matchIngredient(ingredientName) {
        const normalized = (0, normalizer_1.normalizeIngredientName)(ingredientName);
        // First try exact matching including synonyms
        const exactMatch = ingredientsList.find(item => normalized.includes((0, normalizer_1.normalizeIngredientName)(item.key)));
        if (exactMatch) {
            return {
                name: ingredientName,
                normalized,
                matched: true,
                details: {
                    name: exactMatch.name,
                    description: exactMatch.description,
                    category: exactMatch.category,
                    notes: exactMatch.notes,
                    source: exactMatch.source,
                    synonyms: exactMatch.synonyms
                },
                categories: exactMatch.category,
                matchedSynonym: exactMatch.isSynonym ? exactMatch.key : undefined
            };
        }
        // If no exact match, try fuzzy matching
        const fuzzyResults = fuse.search(normalized);
        if (fuzzyResults.length > 0 && fuzzyResults[0].score && fuzzyResults[0].score < (config.fuzzyMatchThreshold || 0.3)) {
            const bestMatch = fuzzyResults[0].item;
            return {
                name: ingredientName,
                normalized,
                matched: true,
                details: {
                    name: bestMatch.name,
                    description: bestMatch.description,
                    category: bestMatch.category,
                    notes: bestMatch.notes,
                    source: bestMatch.source,
                    synonyms: bestMatch.synonyms
                },
                categories: bestMatch.category,
                fuzzyMatch: true,
                confidence: 1 - (fuzzyResults[0].score || 0),
                matchedSynonym: bestMatch.isSynonym ? bestMatch.key : undefined
            };
        }
        return {
            name: ingredientName,
            normalized,
            matched: false
        };
    };
}
