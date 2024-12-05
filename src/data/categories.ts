import { CategoryGroups } from '../types/category';

export const categories: CategoryGroups = {
  alcohols: {
    name: "Alcohols",
    description: "Different types of alcohols used in hair care products",
    categories: {
      "fatty alcohol": {
        name: "Fatty Alcohol",
        description: "Long-chain alcohols that act as emollients and conditioners",
        impact: "good",
        notes: "These alcohols are beneficial for hair and help with moisture retention"
      },
      "drying alcohol": {
        name: "Drying Alcohol",
        description: "Short-chain alcohols that can be drying and damaging to hair",
        impact: "bad",
        notes: "These should generally be avoided in leave-in products"
      },
      "preservative alcohol": {
        name: "Preservative Alcohol",
        description: "Alcohols used primarily as preservatives",
        impact: "caution",
        notes: "Generally safe in small amounts but may be drying in higher concentrations"
      }
    }
  },
  cleansers: {
    name: "Cleansers",
    description: "Ingredients that clean hair and scalp",
    categories: {
      "sulfate": {
        name: "Sulfate",
        description: "Strong cleansing agents that can strip hair of natural oils",
        impact: "bad",
        notes: "Generally recommended to avoid in curly hair care routines"
      },
      "gentle cleanser": {
        name: "Gentle Cleanser",
        description: "Mild cleansing agents that clean without stripping",
        impact: "good",
        notes: "Preferred choice for curly and sensitive hair"
      },
      "harsh cleanser": {
        name: "Harsh Cleanser",
        description: "Strong cleansing agents that can be drying",
        impact: "bad",
        notes: "May disrupt hair's natural moisture balance"
      }
    }
  },
  silicones: {
    name: "Silicones",
    description: "Ingredients that coat hair for shine and manageability",
    categories: {
      "non-soluble silicone": {
        name: "Non-soluble Silicone",
        description: "Silicones that don't dissolve in water and can build up",
        impact: "bad",
        notes: "May require sulfates for complete removal"
      },
      "water-soluble silicone": {
        name: "Water-soluble Silicone",
        description: "Modified silicones that can be removed with gentle cleansing",
        impact: "caution",
        notes: "Less likely to build up but should still be used with care"
      }
    }
  },
  waxes: {
    name: "Waxes",
    description: "Ingredients that provide hold and coating",
    categories: {
      "non-soluble wax": {
        name: "Non-soluble Wax",
        description: "Waxes that don't dissolve in water and can build up",
        impact: "bad",
        notes: "May require sulfates for complete removal"
      },
      "emulsifying wax": {
        name: "Emulsifying Wax",
        description: "Modified waxes that help combine oil and water",
        impact: "good",
        notes: "Generally considered safe for hair care"
      }
    }
  },
  other: {
    name: "Other Ingredients",
    description: "Miscellaneous ingredient categories",
    categories: {
      "astringent": {
        name: "Astringent",
        description: "Ingredients that can tighten and dry the scalp",
        impact: "caution",
        notes: "Use with caution as they may be drying"
      },
      "emollient": {
        name: "Emollient",
        description: "Ingredients that soften and smooth hair",
        impact: "good",
        notes: "Helps maintain moisture and improve manageability"
      },
      "pH adjuster": {
        name: "pH Adjuster",
        description: "Ingredients that modify product pH",
        impact: "good",
        notes: "Important for maintaining proper hair and scalp pH"
      }
    }
  }
};