import type { CategoryGroups } from '../../types';

export const testCategories: CategoryGroups = {
  alcohols: {
    name: "Alcohols",
    description: "Different types of alcohols used in hair care",
    categories: {
      "fatty alcohol": {
        name: "Fatty Alcohol",
        description: "Long-chain alcohols that condition",
        tags: ["CG Friendly"],
        notes: "Beneficial for hair"
      },
      "drying alcohol": {
        name: "Drying Alcohol",
        description: "Short-chain alcohols that can be drying",
        tags: ["Not CG Friendly"],
        notes: "Should be avoided in leave-in products"
      },
      "solvent alcohol": {
        name: "Solvent Alcohol",
        description: "Alcohols used as solvents",
        tags: ["CG Friendly"],
        notes: "Commonly used in cosmetics as a solvent"
      }
    },
    matchConfig: {
      partials: ["alcohol"]
    }
  },
  cleansers: {
    name: "Cleansers",
    description: "Ingredients that clean hair and scalp",
    categories: {
      "sulfate": {
        name: "Sulfate",
        description: "Strong cleansing agents",
        tags: ["Not CG Friendly"],
        notes: "Can be harsh and stripping",
        matchConfig: {
          partials: ["sulfate"]
        }
      },
      "gentle cleanser": {
        name: "Gentle Cleanser",
        description: "Mild cleansing agents",
        tags: ["CG Friendly"],
        notes: "Preferred for curly hair"
      },
      "soap": {
        name: "Soap",
        description: "Soap is a cleansing agent",
        tags: ["Not CG Friendly"],
        notes: "Can be harsh and stripping",
        matchConfig: {
          partials: ["soap", "saponin"]
        }
      }
    }
  },
  others: {
    name: "Others",
    description: "Other ingredients not categorized",
    categories: {
      "waxes": {
        name: "Waxes",
        description: "Waxes that are not water-soluble",
        tags: ["Not CG Friendly"],
        notes: "Can build up and cause scalp issues if you don't use a clarifying shampoo",
        matchConfig: {
          partials: ["wax"]
        }
      }
    }
  },
  silicones: {
    name: "Silicones",
    description: "Different types of silicones used in hair care",
    categories: {
      "water-soluble silicone": {
        name: "Water-Soluble Silicone",
        description: "Silicones that are water-soluble",
        tags: ["CG Friendly"],
        notes: "Generally considered safe as it doesn't build up"
      },
      "non-water-soluble silicone": {
        name: "Non-Water-Soluble Silicone",
        description: "Silicones that are not water-soluble",
        tags: ["Not CG Friendly"],
        notes: "Can build up and cause scalp issues if you don't use a clarifying shampoo"
      }
    },
  }
}
