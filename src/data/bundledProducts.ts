// This file is auto-generated. Do not edit directly.
import type { ProductDatabase } from '../types';

export const defaultProductDatabase: ProductDatabase = {
  "products": {
    "shampoo": {
      "name": "Curl Shampoo",
      "id": "shampoo",
      "brand": "Kristin Ess",
      "buy_url": "https://www.kristinesshair.com/products/moisture-rich-curl-shampoo",
      "systems_excluded": [
        "curly_default"
      ],
      "product_categories": [
        "shampoos"
      ]
    }
  }
};

export function getBundledProducts(): ProductDatabase {
  return defaultProductDatabase;
}
