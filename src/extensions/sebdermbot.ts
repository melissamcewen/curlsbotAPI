import type { AnalysisResult, SebdermAnalysis } from '../types';

interface TriggerDefinition {
  type: 'group' | 'category' | 'specific';
  id: string;
  reason: string;
  exceptions?: string[];
  specificIds?: string[];
}

///add Glycerol

const triggerDefinitions: TriggerDefinition[] = [
  {
    type: 'category',
    id: 'light_oils',
    reason: 'Contains fatty acids that can feed Malassezia yeast',
    exceptions: ['squalane', 'mineral_oil'],
  },
  {
    type: 'category',
    id: 'medium_oils',
    reason: 'Contains fatty acids that can feed Malassezia yeast',
  },
  {
    type: 'category',
    id: 'heavy_oils',
    reason: 'Contains fatty acids that can feed Malassezia yeast',
  },

  {
    type: 'group',
    id: 'waxes',
    reason:
      'Can create a barrier that traps moisture and heat, promoting yeast growth',
  },
  {
    type: 'specific',
    id: 'emollient_alcohols',
    reason: 'This specific fatty alcohol can feed Malassezia yeast',
    specificIds: ['emulsifying_wax', 'cetearyl_alcohol'],
  },
  {
    type: 'category',
    id: 'esters',
    reason: 'Esters can feed Malassezia yeast',
    exceptions: ['caprylic_capric_triglyceride'],
  },
  {
    type: 'category',
    id: 'polysorbates',
    reason: 'polysorbates can feed Malassezia yeast',
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
          // For oils group, check both exceptions list and essential_oils category
          if (def.id === 'oils') {
            isMatch =
              !def.exceptions?.includes(ingredient.ingredient.id) &&
              !ingredient.ingredient.categories.includes('essential_oils');
          } else {
            // For other groups, just check exceptions list
            isMatch = !def.exceptions?.includes(ingredient.ingredient.id);
          }
        } else if (
          def.type === 'category' &&
          ingredient.ingredient.categories.includes(def.id)
        ) {
          // Check exceptions for categories
          isMatch = !def.exceptions?.includes(ingredient.ingredient.id);
        } else if (
          def.type === 'specific' &&
          ingredient.ingredient.categories.includes(def.id) &&
          def.specificIds?.includes(ingredient.ingredient.id)
        ) {
          // For specific ingredients within a category
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
