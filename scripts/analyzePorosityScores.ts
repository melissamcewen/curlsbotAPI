import { getBundledProducts } from '../src/data/bundledProducts';

function analyzePorosityScores() {
  const { products } = getBundledProducts();

  let lowPorositySum = 0;
  let lowPorosityCount = 0;
  let highPorositySum = 0;
  let highPorosityCount = 0;

  // Analyze each product
  Object.values(products).forEach((product) => {
    if (!product.extensions?.porosity || !product.tags) return;

    // Check low porosity products
    if (product.tags.includes('low_porosity')) {
      lowPorositySum += product.extensions.porosity.low;
      lowPorosityCount++;
    }

    // Check high porosity products
    if (product.tags.includes('high_porosity')) {
      highPorositySum += product.extensions.porosity.high;
      highPorosityCount++;
    }
  });

  // Calculate averages
  const avgLowScore =
    lowPorosityCount > 0 ? lowPorositySum / lowPorosityCount : 0;
  const avgHighScore =
    highPorosityCount > 0 ? highPorositySum / highPorosityCount : 0;

  console.log('\nPorosity Score Analysis:');
  console.log('------------------------');
  console.log(`Products tagged 'low_porosity': ${lowPorosityCount}`);
  console.log(`Average low porosity score: ${avgLowScore.toFixed(2)}`);
  console.log(`\nProducts tagged 'high_porosity': ${highPorosityCount}`);
  console.log(`Average high porosity score: ${avgHighScore.toFixed(2)}`);
}

analyzePorosityScores();
