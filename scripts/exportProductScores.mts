import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defaultProductDatabase } from '../src/data/bundledProducts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = join(__dirname, '../product_scores.csv');

function exportProductScores() {
  const { products } = defaultProductDatabase;

  // Create CSV header
  const csvRows = [
    'Name,Brand,Product Type,Buy URL,Frizzbot Score,' +
      'Simple Humectants Count,Film Forming Humectants Count,Emollients Count,' +
      'Simple Humectants,Film Forming Humectants,Emollients',
  ];

  // Add each product
  for (const product of Object.values(products)) {
    const name = product.name.replace(/,/g, ''); // Remove commas from names
    const brand = (product.brand || '').replace(/,/g, ''); // Remove commas from brand
    const productType = (product.product_categories || [])
      .join(' & ')
      .replace(/,/g, ''); // Join categories with &
    const buyUrl = product.buy_url || '';
    const score = product.frizzbot?.score || 'N/A';

    // Get Frizzbot counts
    const simpleHumectantsCount =
      product.frizzbot?.simple_humectants_number || 0;
    const filmFormingHumectantsCount =
      product.frizzbot?.film_forming_humectants_number || 0;
    const emollientsCount = product.frizzbot?.emollients_number || 0;

    // Get ingredient lists (join with semicolons to avoid CSV conflicts)
    const simpleHumectants = (product.frizzbot?.simple_humectants || [])
      .join('; ')
      .replace(/,/g, '');
    const filmFormingHumectants = (
      product.frizzbot?.film_forming_humectants || []
    )
      .join('; ')
      .replace(/,/g, '');
    const emollients = (product.frizzbot?.emollients || [])
      .join('; ')
      .replace(/,/g, '');

    csvRows.push(
      `${name},${brand},${productType},${buyUrl},${score},` +
        `${simpleHumectantsCount},${filmFormingHumectantsCount},${emollientsCount},` +
        `"${simpleHumectants}","${filmFormingHumectants}","${emollients}"`,
    );
  }

  // Write to file
  writeFileSync(OUTPUT_FILE, csvRows.join('\n'));
  console.log(`Exported product scores to ${OUTPUT_FILE}`);
}

exportProductScores();
