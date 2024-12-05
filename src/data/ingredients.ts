import { Ingredient } from '../types';

export const ingredients: Record<string, Ingredient> = {
  // Drying Alcohols
  "alcohol denat": {
    name: "Alcohol Denat.",
    description: "A type of denatured alcohol commonly used as a solvent. Can be drying and potentially damaging to hair.",
    category: ["drying alcohol"],
    notes: "Avoid in leave-in products and frequent-use products",
    synonyms: [
      "alcohol 40-b", 
      "alcohol 40b",
      "alcohol-40b",
      "denatured alcohol",
      "sd alcohol",
      "sd alcohol 40",
      "ethyl alcohol",
      "ethanol"
    ]
  },

  "isopropyl alcohol": {
    name: "Isopropyl Alcohol",
    description: "A drying alcohol that can be harsh on hair. Often used as a solvent.",
    category: ["drying alcohol"],
    notes: "May be drying to hair and should be avoided in leave-in products",
    synonyms: [
      "isopropanol",
      "propyl alcohol",
      "propanol"
    ]
  },

  // Fatty Alcohols
  "cetyl alcohol": {
    name: "Cetyl Alcohol",
    description: "A fatty alcohol that acts as an emollient and emulsifier. It's considered safe for curly hair routines.",
    category: ["fatty alcohol", "emollient"],
    notes: "Common in conditioners and styling products",
    synonyms: ["hexadecan-1-ol", "1-hexadecanol", "palmityl alcohol"]
  },

  "cetearyl alcohol": {
    name: "Cetearyl Alcohol",
    description: "A blend of cetyl and stearyl alcohols. It's a fatty alcohol that helps stabilize formulations and provides conditioning.",
    category: ["fatty alcohol", "emollient"],
    notes: "Commonly used in hair conditioners",
    synonyms: ["cetostearyl alcohol", "ceteryl alcohol", "cetyl stearyl alcohol"]
  },

  "stearyl alcohol": {
    name: "Stearyl Alcohol",
    description: "A fatty alcohol that provides conditioning and emollient properties.",
    category: ["fatty alcohol", "emollient"],
    notes: "Common in hair conditioners and moisturizing products"
  },

  "behenyl alcohol": {
    name: "Behenyl Alcohol",
    description: "A long-chain fatty alcohol that acts as an emollient and thickener.",
    category: ["fatty alcohol", "emollient"],
    notes: "Provides conditioning benefits to hair"
  },

  "myristyl alcohol": {
    name: "Myristyl Alcohol",
    description: "A fatty alcohol derived from natural fats and oils, used as an emollient.",
    category: ["fatty alcohol", "emollient"]
  },

  "c30-50 alcohols": {
    name: "C30-50 Alcohols",
    description: "A group of long-chain fatty alcohols used as emollients and thickeners.",
    category: ["fatty alcohol", "emollient"]
  },

  "lanolin alcohol": {
    name: "Lanolin Alcohol",
    description: "A waxy alcohol derived from lanolin, provides moisturizing properties.",
    category: ["fatty alcohol", "emollient", "moisturizer"],
    synonyms: ["wool alcohol", "wool wax alcohol"]
  },

  "benzyl alcohol": {
    name: "Benzyl Alcohol",
    description: "An aromatic alcohol used as a preservative and fragrance ingredient.",
    category: ["preservative alcohol"],
    notes: "Generally considered safe in hair care products"
  },

  "aminomethyl propanol": {
    name: "Aminomethyl Propanol",
    description: "A pH adjuster and buffering agent commonly used in hair care products.",
    category: ["pH adjuster"],
    synonyms: [
      "amino-2-methyl-1-propanol",
      "amino methyl propanol",
      "AMP"
    ]
  },

  // Sulfates
  "sodium lauryl sulfate": {
    name: "Sodium Lauryl Sulfate",
    description: "A strong cleansing agent and primary surfactant. Can be harsh and drying on hair.",
    category: ["sulfate", "harsh cleanser"],
    notes: "Generally recommended to avoid in curly hair routines",
    synonyms: [
      "sodium lauryl sulphate",
      "SLS"
    ]
  },

  "sodium laureth sulfate": {
    name: "Sodium Laureth Sulfate",
    description: "A strong cleansing agent and surfactant commonly found in shampoos. Can be harsh and stripping on hair.",
    category: ["sulfate", "harsh cleanser"],
    notes: "Generally recommended to avoid in curly hair routines",
    source: ["https://pubchem.ncbi.nlm.nih.gov/compound/Sodium-dodecyl-sulfate"],
    synonyms: [
      "SLES",
      "sodium lauryl ether sulfate",
      "sodium lauryl ethoxy sulfate",
      "sodium laureth sulphate"
    ]
  },

  "ammonium lauryl sulfate": {
    name: "Ammonium Lauryl Sulfate",
    description: "A strong cleansing agent similar to sodium lauryl sulfate.",
    category: ["sulfate", "harsh cleanser"],
    notes: "Can be harsh and drying on hair",
    synonyms: [
      "ammonium lauryl sulphate",
      "ALS"
    ]
  },

  "ammonium laureth sulfate": {
    name: "Ammonium Laureth Sulfate",
    description: "A modified form of ammonium lauryl sulfate, slightly gentler but still a strong cleanser.",
    category: ["sulfate", "harsh cleanser"],
    synonyms: [
      "ammonium laureth sulphate",
      "ALES"
    ]
  },

  // Gentle Cleansers
  "cocamidopropyl betaine": {
    name: "Cocamidopropyl Betaine",
    description: "A gentle surfactant derived from coconut oil. Often used as a secondary surfactant to reduce the harshness of other cleansers.",
    category: ["gentle cleanser", "surfactant"],
    notes: "Generally considered safe for curly hair routines",
    source: ["https://pubchem.ncbi.nlm.nih.gov/compound/Cocamidopropyl-betaine"],
    synonyms: [
      "CAPB",
      "coco betaine",
      "cocoyl betaine"
    ]
  },

  "sodium cocoyl isethionate": {
    name: "Sodium Cocoyl Isethionate",
    description: "A gentle cleansing agent derived from coconut oil.",
    category: ["gentle cleanser", "surfactant"],
    notes: "Good for sensitive scalp and curly hair",
    synonyms: ["SCI"]
  },

  "decyl glucoside": {
    name: "Decyl Glucoside",
    description: "A very gentle surfactant derived from plant-based materials.",
    category: ["gentle cleanser", "surfactant"],
    notes: "Suitable for sensitive scalp and curly hair",
    synonyms: ["decyl polyglucose"]
  },

  // Silicones
  "dimethicone": {
    name: "Dimethicone",
    description: "A silicone that forms a barrier on hair. Can build up without proper cleansing.",
    category: ["non-soluble silicone"],
    notes: "May require sulfates for complete removal",
    synonyms: [
      "polydimethylsiloxane",
      "PDMS"
    ]
  },

  // Waxes
  "beeswax": {
    name: "Beeswax",
    description: "A natural wax that can create buildup on hair.",
    category: ["non-soluble wax"],
    notes: "May require sulfates for removal",
    synonyms: [
      "cera alba",
      "apis mellifera wax",
      "bees wax",
      "cire dabeille"
    ]
  },

  "emulsifying wax": {
    name: "Emulsifying Wax",
    description: "A modified wax that helps combine oil and water in products.",
    category: ["emulsifying wax"],
    notes: "Generally considered safe for hair care",
    synonyms: [
      "emulsifying wax nf",
      "e-wax"
    ]
  },

  // Other
  "witch hazel": {
    name: "Witch Hazel",
    description: "An astringent ingredient that can be drying to hair.",
    category: ["astringent"],
    notes: "Use with caution in hair care products",
    synonyms: [
      "hamamelis virginiana",
      "winterbloom"
    ]
  }

    "dimethicone": {
    name: "Dimethicone",
    description: "A non-water-soluble silicone that forms a barrier on hair. Can build up without proper cleansing.",
    category: ["non-soluble silicone"],
    notes: "May require sulfates for complete removal",
    synonyms: [
      "polydimethylsiloxane",
      "PDMS",
      "dimethyl silicone",
      "dimethylpolysiloxane"
    ]
  },

  "amodimethicone": {
    name: "Amodimethicone",
    description: "A modified silicone that adheres more strongly to damaged areas of hair.",
    category: ["non-soluble silicone"],
    notes: "Can build up over time, may require clarifying",
    synonyms: [
      "amino functional silicone",
      "aminopropyl dimethicone"
    ]
  },

  "cyclomethicone": {
    name: "Cyclomethicone",
    description: "A lightweight, volatile silicone that evaporates from hair.",
    category: ["water-soluble silicone"],
    notes: "Generally considered safe as it doesn't build up",
    synonyms: [
      "cyclopentasiloxane",
      "cyclotetrasiloxane",
      "cyclic silicone"
    ]
  },

  "peg-dimethicone": {
    name: "PEG-Dimethicone",
    description: "A water-soluble silicone modified with polyethylene glycol.",
    category: ["water-soluble silicone"],
    notes: "Less likely to build up than regular dimethicone",
    synonyms: [
      "bis-peg dimethicone",
      "peg-modified dimethicone",
      "dimethicone copolyol"
    ]
  },

  // Waxes
  "beeswax": {
    name: "Beeswax",
    description: "A natural wax that can create buildup on hair.",
    category: ["non-soluble wax"],
    notes: "May require sulfates for removal",
    synonyms: [
      "cera alba",
      "apis mellifera wax",
      "bees wax",
      "cire dabeille"
    ]
  },

  "candelilla wax": {
    name: "Candelilla Wax",
    description: "A plant-based wax that can create buildup on hair.",
    category: ["non-soluble wax"],
    notes: "May require clarifying shampoo for removal",
    synonyms: [
      "euphorbia cerifera wax",
      "candelilla cera",
      "candelia wax"
    ]
  },

  "microcrystalline wax": {
    name: "Microcrystalline Wax",
    description: "A petroleum-based wax that can create significant buildup.",
    category: ["non-soluble wax"],
    notes: "May be difficult to remove without sulfates",
    synonyms: [
      "cera microcristallina",
      "microcrystalline cera",
      "mineral wax"
    ]
  },

  "emulsifying wax": {
    name: "Emulsifying Wax",
    description: "A modified wax that helps combine oil and water in products.",
    category: ["emulsifying wax"],
    notes: "Generally considered safe for hair care",
    synonyms: [
      "emulsifying wax nf",
      "e-wax",
      "peg-150 stearate",
      "polysorbate 60"
    ]
  },

  "peg-75 lanolin": {
    name: "PEG-75 Lanolin",
    description: "A modified lanolin wax that is water-soluble.",
    category: ["emulsifying wax"],
    notes: "Less likely to cause buildup than regular lanolin",
    synonyms: [
      "polyethylene glycol lanolin",
      "lanolin peg-75"
    ]
  },

  // Soaps and Harsh Cleansers
  "sodium palm kernelate": {
    name: "Sodium Palm Kernelate",
    description: "A soap made from palm kernel oil. Can be harsh and drying.",
    category: ["soap", "harsh cleanser"],
    notes: "May disrupt hair's natural pH balance",
    synonyms: [
      "saponified palm kernel oil",
      "palm kernel soap"
    ]
  },

  "sodium palmate": {
    name: "Sodium Palmate",
    description: "A soap made from palm oil. Can be stripping and raise hair's pH.",
    category: ["soap", "harsh cleanser"],
    notes: "Not recommended for regular hair washing",
    synonyms: [
      "saponified palm oil",
      "palm soap"
    ]
  },

  "sodium cocoate": {
    name: "Sodium Cocoate",
    description: "A soap made from coconut oil. Can be drying despite natural origin.",
    category: ["soap", "harsh cleanser"],
    notes: "May be too alkaline for hair care",
    synonyms: [
      "saponified coconut oil",
      "coconut soap"
    ]
  },

  "potassium hydroxide": {
    name: "Potassium Hydroxide",
    description: "A strong alkali used in making liquid soaps.",
    category: ["soap", "harsh cleanser"],
    notes: "Present in liquid castile soaps",
    synonyms: [
      "KOH",
      "caustic potash",
      "potassium hydrate"
    ]
  },

};