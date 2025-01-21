import { getBundledProducts } from '../src/data/bundledProducts';

function analyzePorosityScores() {
  const { products } = getBundledProducts();

  let lowPorositySum = 0;
  let lowPorosityCount = 0;
  let highPorositySum = 0;
  let highPorosityCount = 0;
  let lowPorosityHighScoreSum = 0; // Low porosity products' high scores
  let highPorosityLowScoreSum = 0; // High porosity products' low scores

  // Analyze each product
  Object.values(products).forEach((product) => {
    if (!product.extensions?.porosity || !product.tags) return;

    // Check low porosity products
    if (product.tags.includes('low_porosity')) {
      lowPorositySum += product.extensions.porosity.low;
      lowPorosityHighScoreSum += product.extensions.porosity.high;
      lowPorosityCount++;
    }

    // Check high porosity products
    if (product.tags.includes('high_porosity')) {
      highPorositySum += product.extensions.porosity.high;
      highPorosityLowScoreSum += product.extensions.porosity.low;
      highPorosityCount++;
    }
  });

  // Calculate averages
  const avgLowScore =
    lowPorosityCount > 0 ? lowPorositySum / lowPorosityCount : 0;
  const avgHighScore =
    highPorosityCount > 0 ? highPorositySum / highPorosityCount : 0;
  const avgLowPorosityHighScore =
    lowPorosityCount > 0 ? lowPorosityHighScoreSum / lowPorosityCount : 0;
  const avgHighPorosityLowScore =
    highPorosityCount > 0 ? highPorosityLowScoreSum / highPorosityCount : 0;

  console.log('\nPorosity Score Analysis:');
  console.log('------------------------');
  console.log(`Products tagged 'low_porosity': ${lowPorosityCount}`);
  console.log(`Average low porosity score: ${avgLowScore.toFixed(2)}`);
  console.log(
    `Average high porosity score for low porosity products: ${avgLowPorosityHighScore.toFixed(
      2,
    )}`,
  );
  console.log(`\nProducts tagged 'high_porosity': ${highPorosityCount}`);
  console.log(`Average high porosity score: ${avgHighScore.toFixed(2)}`);
  console.log(
    `Average low porosity score for high porosity products: ${avgHighPorosityLowScore.toFixed(
      2,
    )}`,
  );
}

analyzePorosityScores();
