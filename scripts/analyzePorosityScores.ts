import { getBundledProducts } from '../src/data/bundledProducts';

function analyzePorosityScores() {
  const { products } = getBundledProducts();

  let lowPorositySum = 0;
  let lowPorosityCount = 0;
  let highPorositySum = 0;
  let highPorosityCount = 0;
  let lowPorosityHighScoreSum = 0; // Low porosity products' high scores
  let highPorosityLowScoreSum = 0; // High porosity products' low scores

  // For conditioners specifically
  let lowPorosityConditionerLowSum = 0;
  let lowPorosityConditionerCount = 0;
  let highPorosityConditionerHighSum = 0;
  let highPorosityConditionerCount = 0;

  // Analyze each product
  Object.values(products).forEach((product) => {
    if (!product.extensions?.porosity || !product.tags) return;

    const isConditioner = product.product_categories?.some((cat) =>
      ['deep_conditioners', 'leave_ins', 'cowashes'].includes(cat),
    );

    // Check low porosity products
    if (product.tags.includes('low_porosity')) {
      lowPorositySum += product.extensions.porosity.low;
      lowPorosityHighScoreSum += product.extensions.porosity.high;
      lowPorosityCount++;

      if (isConditioner) {
        lowPorosityConditionerLowSum += product.extensions.porosity.low;
        lowPorosityConditionerCount++;
      }
    }

    // Check high porosity products
    if (product.tags.includes('high_porosity')) {
      highPorositySum += product.extensions.porosity.high;
      highPorosityLowScoreSum += product.extensions.porosity.low;
      highPorosityCount++;

      if (isConditioner) {
        highPorosityConditionerHighSum += product.extensions.porosity.high;
        highPorosityConditionerCount++;
      }
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

  // Calculate conditioner averages
  const avgLowPorosityConditionerLowScore =
    lowPorosityConditionerCount > 0
      ? lowPorosityConditionerLowSum / lowPorosityConditionerCount
      : 0;
  const avgHighPorosityConditionerHighScore =
    highPorosityConditionerCount > 0
      ? highPorosityConditionerHighSum / highPorosityConditionerCount
      : 0;

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

  console.log('\nConditioner Analysis:');
  console.log('------------------------');
  console.log(`Low porosity conditioners: ${lowPorosityConditionerCount}`);
  console.log(
    `Average low porosity score: ${avgLowPorosityConditionerLowScore.toFixed(
      2,
    )}`,
  );

  console.log(`\nHigh porosity conditioners: ${highPorosityConditionerCount}`);
  console.log(
    `Average high porosity score: ${avgHighPorosityConditionerHighScore.toFixed(
      2,
    )}`,
  );
}

analyzePorosityScores();
