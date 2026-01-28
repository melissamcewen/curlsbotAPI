import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizer } from '../src/utils/normalizer.js';
import csv from 'csv-parser';
import { defaultProductDatabase } from '../src/data/bundledProducts.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if a product already exists in bundledProducts
function productExists(productName) {
  const existingProducts = Object.values(defaultProductDatabase.products);
  const normalizedNewName = productName.toLowerCase().trim();

  const matchingProduct = existingProducts.find(product => {
    const normalizedExistingName = product.name.toLowerCase().trim();

    // Exact match
    if (normalizedExistingName === normalizedNewName) {
      return true;
    }

    // Check if existing product name is a substring of new product name
    if (normalizedNewName.includes(normalizedExistingName)) {
      return true;
    }

    // Check if new product name is a substring of existing product name
    if (normalizedExistingName.includes(normalizedNewName)) {
      return true;
    }

    return false;
  });

  return matchingProduct;
}

// Function to read CSV file and convert to JSON
async function convertCsvToJson() {
  // Paths
  const csvFilePath = path.join(__dirname, '../logs/new-products-jan.csv');
  const outputFilePath = path.join(__dirname, '../logs/products_new.json');

  // Array to store the products
  const products = [];
  let skippedCount = 0;
  let addedCount = 0;

  return new Promise((resolve, reject) => {
    // Create a read stream and pipe it through csv-parser
    fs.createReadStream(csvFilePath)
      .on('error', (err) => {
        reject(new Error(`Error reading CSV file: ${err.message}`));
      })
      .pipe(csv())
      .on('data', (row) => {
        try {
          const productName = row['Product Name'];

          // Skip rows without a product name
          if (!productName || productName.trim() === '') {
            console.log(`Skipping row with no product name`);
            return;
          }

          // Check if product already exists
          const existingProduct = productExists(productName);
          if (existingProduct) {
            console.log(`Skipping existing product: "${productName}" (matches existing: "${existingProduct.name}")`);
            skippedCount++;
            return; // Skip this product
          }

          // Get product categories
          const categories = [];
          if (row['Shampoos'] === 'TRUE') categories.push('Shampoos');
          if (row['Scalp Treatments'] === 'TRUE') categories.push('Scalp Treatments');
          if (row['Clarifying Shampoos'] === 'TRUE') categories.push('Clarifying Shampoos');
          if (row['Co-Washes'] === 'TRUE') categories.push('Co-Washes');
          if (row['Conditioners'] === 'TRUE') categories.push('Conditioners');
          if (row['Deep Conditioners'] === 'TRUE') categories.push('Deep Conditioners');
          if (row['Protein Treatments'] === 'TRUE') categories.push('Protein Treatments');
          if (row['Bond Builders'] === 'TRUE') categories.push('Bond Builders');
          if (row['Curl Creams'] === 'TRUE') categories.push('Curl Creams');
          if (row['Gels + Mousses'] === 'TRUE') categories.push('Gels + Mousses');
          if (row['Hairsprays'] === 'TRUE') categories.push('Hairsprays');
          if (row['Leave-in Conditioners'] === 'TRUE') categories.push('Leave-in Conditioners');
          if (row['Styling Serums'] === 'TRUE') categories.push('Styling Serums');
          if (row['Accessories'] === 'TRUE') categories.push('Accessories');
          if (row['Refreshing Sprays'] === 'TRUE') categories.push('Refreshing Sprays');
          if (row['Detanglers'] === 'TRUE') categories.push('Detanglers');
          if (row['Oils'] === 'TRUE') categories.push('Oils');
          if (row['Heat Protectants'] === 'TRUE') categories.push('Heat Protectants');
          if (row['Detox Treatments'] === 'TRUE') categories.push('Detox Treatments');

          // Get hair type tags
          const tags = ['samples']; // Always add 'samples' tag

          if (row['Wavy Hair Approved'] === 'TRUE') tags.push('wavy');
          if (row['Curly Hair Approved '] === 'TRUE') tags.push('curly');
          if (row['Coily Hair Approved'] === 'TRUE') tags.push('coily');

          // Add porosity tags based on Heaviness Level
          const heavinessLevel = parseInt(row['Heaviness Level (1-5)'], 10);
          if (heavinessLevel === 1 || heavinessLevel === 2) {
            tags.push('low_porosity');
          } else if (heavinessLevel === 4 || heavinessLevel === 5) {
            tags.push('high_porosity');
          }

          // Normalize ingredients
          let normalizedIngredients = '';
          if (row['Ingredients ']) {
            try {
              const normalized = normalizer(row['Ingredients ']);
              if (normalized.isValid) {
                normalizedIngredients = normalized.ingredients.join(', ');
              } else {
                normalizedIngredients = row['Ingredients '];
              }
            } catch (error) {
              console.warn(`Warning: Could not normalize ingredients for ${row['Product Name']}: ${error.message}`);
              normalizedIngredients = row['Ingredients '];
            }
          }

          // Create the buy link
          const buyLinks = [];
          if (row['Product Link'] && row['Product Link'] !== 'n/a' && row['Product Link'] !== '') {
            buyLinks.push({
              url: row['Product Link'],
              retailer: 'TBD'
            });
          }

          // Create the product object
          const product = {
            name: productName,
            brand: '', // Left blank as requested
            buy_links: buyLinks,
            product_categories: categories,
            tags: tags,
            ingredients_raw: normalizedIngredients || row['Ingredients '],
            description: row['Product description'] || ''
          };

          products.push(product);
          addedCount++;
          console.log(`Added new product: ${productName}`);
        } catch (error) {
          const productName = row['Product Name'] || 'Unknown';
          console.warn(`Warning: Error processing row for ${productName}: ${error.message}`);
        }
      })
      .on('end', () => {
        try {
          // Create the final JSON structure
          const outputJson = {
            products: products
          };

          // Write the output file
          fs.writeFileSync(outputFilePath, JSON.stringify(outputJson, null, 2));
          console.log(`Successfully converted CSV to JSON. Output file: ${outputFilePath}`);
          console.log(`\nSummary:`);
          console.log(`- Products added: ${addedCount}`);
          console.log(`- Products skipped (already exist): ${skippedCount}`);
          console.log(`- Total products processed: ${addedCount + skippedCount}`);
          resolve();
        } catch (error) {
          reject(new Error(`Error writing JSON file: ${error.message}`));
        }
      })
      .on('error', (error) => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      });
  });
}

// Execute the conversion
convertCsvToJson()
  .then(() => {
    console.log('Conversion completed successfully!');
  })
  .catch(err => {
    console.error('Error converting CSV to JSON:', err);
    process.exit(1);
  });
