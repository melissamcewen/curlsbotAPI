import Fuse from 'fuse.js';
import { Ingredient, IngredientMatch } from '../types';
import { ingredients } from '../data/ingredients';
import { normalizeIngredientName } from './normalizer';

// Create a searchable array of ingredients with their synonyms
const ingredientsList = Object.entries(ingredients).flatMap(([key, value]) => {
  const mainEntry = { key, ...value };
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
  threshold: 0.3,
  includeScore: true
};

const fuse = new Fuse(ingredientsList, fuseOptions);

export function matchIngredient(ingredientName: string): IngredientMatch {
  const normalized = normalizeIngredientName(ingredientName);
  
  // First try exact matching including synonyms
  const exactMatch = ingredientsList.find(item => 
    normalized.includes(normalizeIngredientName(item.key))
  );

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
  
  if (fuzzyResults.length > 0 && fuzzyResults[0].score && fuzzyResults[0].score < 0.3) {
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
}