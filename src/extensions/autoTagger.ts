import type { AnalysisResult, AutoTaggerAnalysis } from '../types';

interface TagRule {
  tag: string;
  type: 'category' | 'group' | 'ingredient' | 'string';
  value: string | string[];
  negate?: boolean;
  mutuallyExclusiveWith?: string[];
}

const tagRules: TagRule[] = [
  {
    tag: 'protein-free',
    type: 'category',
    value: ['proteins', 'amino_acids'],
    negate: true,
    mutuallyExclusiveWith: ['protein'],
  },
  {
    tag: 'protein',
    type: 'category',
    value: ['proteins', 'amino_acids'],
  },
  {
    tag: 'glycerin-free',
    type: 'ingredient',
    value: 'glycerin',
    negate: true,
  },
];

export function autoTagger(analysis: AnalysisResult): AutoTaggerAnalysis {
  const tags: string[] = [];
  const appliedTags = new Set<string>();

  // Process each rule
  for (const rule of tagRules) {
    // Skip if this tag is mutually exclusive with an already applied tag
    if (rule.mutuallyExclusiveWith?.some((tag) => appliedTags.has(tag))) {
      continue;
    }

    let shouldApplyTag = false;

    switch (rule.type) {
      case 'category':
        if (rule.negate) {
          // For negated rules (like protein-free), ALL ingredients must NOT have the category
          shouldApplyTag = analysis.ingredients.every((ingredient) => {
            if (!ingredient.ingredient) return true; // Skip unknown ingredients
            const hasCategory = Array.isArray(rule.value)
              ? rule.value.some((cat) =>
                  ingredient.ingredient?.categories.includes(cat),
                )
              : ingredient.ingredient.categories.includes(rule.value as string);
          
            return !hasCategory;
          });

        } else {
          // For positive rules (like protein), ANY ingredient can have the category
          shouldApplyTag = analysis.ingredients.some((ingredient) => {
            if (!ingredient.ingredient) return false;
            const hasCategory = Array.isArray(rule.value)
              ? rule.value.some((cat) =>
                  ingredient.ingredient?.categories.includes(cat),
                )
              : ingredient.ingredient.categories.includes(rule.value as string);
            return hasCategory;
          });
        }
        break;

      case 'group':
        shouldApplyTag = analysis.ingredients.some((ingredient) => {
          if (!ingredient.ingredient?.group) return false;
          const hasGroup = Array.isArray(rule.value)
            ? rule.value.includes(ingredient.ingredient.group)
            : ingredient.ingredient.group === rule.value;
          return rule.negate ? !hasGroup : hasGroup;
        });
        break;

      case 'ingredient':
        shouldApplyTag = analysis.ingredients.some((ingredient) => {
          const hasIngredient = Array.isArray(rule.value)
            ? rule.value.includes(ingredient.name.toLowerCase())
            : ingredient.name.toLowerCase() ===
              (rule.value as string).toLowerCase();
          return rule.negate ? !hasIngredient : hasIngredient;
        });
        break;

      case 'string':
        shouldApplyTag = analysis.ingredients.some((ingredient) => {
          const hasString = Array.isArray(rule.value)
            ? rule.value.some((str) =>
                ingredient.name.toLowerCase().includes(str.toLowerCase()),
              )
            : ingredient.name
                .toLowerCase()
                .includes((rule.value as string).toLowerCase());
          return rule.negate ? !hasString : hasString;
        });
        break;
    }

    if (shouldApplyTag) {
      tags.push(rule.tag);
      appliedTags.add(rule.tag);
    }
  }

  return { tags };
}
