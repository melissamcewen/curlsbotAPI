"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyzer = void 0;
const parser_1 = require("./parser");
const matcher_1 = require("./matcher");
const categoryInfo_1 = require("./categoryInfo");
const defaultConfig = {
    database: {
        ingredients: {},
        categories: {}
    },
    fuzzyMatchThreshold: 0.3
};
class Analyzer {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.matcher = (0, matcher_1.createMatcher)(this.config);
    }
    analyzeIngredients(ingredientString) {
        const ingredientList = (0, parser_1.parseIngredientList)(ingredientString);
        const matches = ingredientList.map(ingredient => this.matcher(ingredient));
        // Extract all unique categories from matched ingredients
        const categories = Array.from(new Set(matches
            .filter(match => match.matched && match.categories)
            .flatMap(match => match.categories))).sort();
        return {
            matches,
            categories
        };
    }
    findIngredientsByCategory(category) {
        return Object.values(this.config.database.ingredients)
            .filter(ingredient => ingredient.category.includes(category))
            .map(ingredient => ingredient.name);
    }
    getCategoryInfo(categoryName) {
        return (0, categoryInfo_1.getCategoryInfo)(categoryName);
    }
    getCategoryGroup(categoryName) {
        return (0, categoryInfo_1.getCategoryGroup)(categoryName);
    }
}
exports.Analyzer = Analyzer;
