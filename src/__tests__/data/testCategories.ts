import { CategoryGroups } from '../../types/category';

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
  },
  others: {
    name: "Others",
    description: "Other ingredients not categorized",
    categories: {}
  }
}
