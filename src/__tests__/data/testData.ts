import { Ingredient } from '../../types';
import { CategoryGroups } from '../../types/category';

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
  }
};

export const testCategories: CategoryGroups = {
  alcohols: {
    name: "Alcohols",
    description: "Different types of alcohols used in hair care",
    categories: {
      "fatty alcohol": {
        name: "Fatty Alcohol",
        description: "Long-chain alcohols that condition",
        impact: "good",
        notes: "Beneficial for hair"
      },
      "drying alcohol": {
        name: "Drying Alcohol",
        description: "Short-chain alcohols that can be drying",
        impact: "bad",
        notes: "Should be avoided in leave-in products"
      }
    }
  },
  cleansers: {
    name: "Cleansers",
    description: "Ingredients that clean hair and scalp",
    categories: {
      "sulfate": {
        name: "Sulfate",
        description: "Strong cleansing agents",
        impact: "bad",
        notes: "Can be harsh and stripping"
      },
      "gentle cleanser": {
        name: "Gentle Cleanser",
        description: "Mild cleansing agents",
        impact: "good",
        notes: "Preferred for curly hair"
      }
    }
  }
};