import type { AnalysisResult, SebdermAnalysis } from '../types';

interface TriggerDefinition {
  type: 'group' | 'category';
  id: string;
  reason: string;
  exceptions?: string[];
}

const triggerDefinitions: TriggerDefinition[] = [
  {
    type: 'group',
    id: 'oils',
    reason: 'Contains fatty acids that can feed Malassezia yeast',
    exceptions: ['squalane', 'mineral_oil', 'caprylic_capric_triglyceride'], // MCT oil
  },
  {
    type: 'group',
    id: 'waxes',
    reason:
      'Can create a barrier that traps moisture and heat, promoting yeast growth',
  },
  {
    type: 'category',
    id: 'emollient_alcohols',
    reason: 'Fatty alcohols can feed Malassezia yeast',
  },
  {
    type: 'category',
    id: 'esters',
    reason: 'Esters can feed Malassezia yeast',
  },
  {
    type: 'category',
    id: 'polysorbates',
    reason: 'Polysorbates can feed Malassezia yeast',
  },
  {
    type: 'category',
    id: 'fatty_acids',
    reason:
      'Fatty acids can be metabolized by Malassezia, potentially worsening symptoms',
  },
  {
    type: 'category',
    id: 'amino_acids',
    reason:
      'Amino acids can be metabolized by Malassezia, potentially worsening symptoms',
  },
];

export function sebderm(analysis: AnalysisResult): SebdermAnalysis {
  const triggers: Array<{ id: string; name: string; reason: string }> = [];

  // Check each ingredient in the analysis
  analysis.ingredients.forEach((ingredient) => {
    if (ingredient.ingredient) {
      // Check if this ingredient matches any trigger definitions
      for (const def of triggerDefinitions) {
        let isMatch = false;

        if (def.type === 'group' && ingredient.ingredient.group === def.id) {
          // For groups, check if it's not in exceptions list
          isMatch = !def.exceptions?.includes(ingredient.ingredient.id);
        } else if (
          def.type === 'category' &&
          ingredient.ingredient.categories.includes(def.id)
        ) {
          // For categories, no exceptions currently
          isMatch = true;
        }

        if (isMatch) {
          triggers.push({
            id: ingredient.ingredient.id,
            name: ingredient.ingredient.name,
            reason: def.reason,
          });
          break; // Stop checking other definitions once we find a match
        }
      }
    }
  });

  return {
    hasTriggers: triggers.length > 0,
    triggers,
  };
}
