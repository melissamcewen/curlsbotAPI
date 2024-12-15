import type { System, Settings } from '../../../src/types';

export const testSystems: System[] = [
  {
    name: "Curly Default",
    id: "curly_default",
    description: "Test system",
    settings: ["sulfate_free"]
  },
  {
    name: "No Poo",
    id: "no_poo",
    description: "Test no poo system",
    settings: ["sulfate_free", "silicone_free"]
  }
];

export const testSettings: Settings = {
  sulfate_free: {
    id: "sulfate_free",
    name: "Sulfate Free",
    description: "Avoid sulfates",
    ingredients: ["sls", "sodium_lauryl_sulfate"],
    categories: ["sulfates"],
    flags: ["avoid_sulfates"]
  },
  silicone_free: {
    id: "silicone_free",
    name: "Silicone Free",
    description: "Avoid silicones",
    categories: ["silicones"],
    flags: ["avoid_silicones"]
  },
  mild_detergents_only: {
    id: "mild_detergents_only",
    name: "Mild Detergents Only",
    description: "Only use mild detergents",
    categories: ["harsh_surfactants"],
    flags: ["avoid_harsh_surfactants"]
  }
};
