import { Ingredient } from '../../types';

export const testIngredients: Record<string, Ingredient> = {
  "cetyl alcohol": {
    name: "Cetyl Alcohol",
    description: "A fatty alcohol that acts as an emollient and emulsifier",
    category: ["fatty alcohol", "emollient"],
    notes: "Common in conditioners and styling products",
    synonyms: ["hexadecan-1-ol", "1-hexadecanol"]
  },
  "isopropyl alcohol": {
    name: "Isopropyl Alcohol",
    description: "A drying alcohol that can be harsh on hair",
    category: ["drying alcohol"],
    notes: "May be drying to hair and should be avoided in leave-in products",
    synonyms: ["isopropanol", "propyl alcohol"]
  },
  "sodium laureth sulfate": {
    name: "Sodium Laureth Sulfate",
    description: "A strong cleansing agent commonly found in shampoos",
    category: ["sulfate", "harsh cleanser"],
    notes: "Can be harsh and stripping on hair",
    synonyms: ["SLES", "sodium lauryl ether sulfate"]
  },
  "cocamidopropyl betaine": {
    name: "Cocamidopropyl Betaine",
    description: "A gentle surfactant derived from coconut oil",
    category: ["gentle cleanser", "surfactant"],
    notes: "Generally considered safe for curly hair routines",
    synonyms: ["CAPB", "coco betaine"]
  },
  "potassium sorbate": {
    name: "Potassium Sorbate",
    description: "A preservative commonly used in hair care products",
    category: ["Others"],
    notes: "Commonly used in hair care products to prevent mold and bacteria",
    synonyms: ["sorbic acid potassium"]
  },
  "potassium hydrate": {
    name: "Potassium Hydrate",
    description: "A drying agent commonly used in hair care products",
    category: ["Others"],
    notes: "Commonly used in hair care products to remove moisture",
    synonyms: ["potassium salt"]
  }
}
