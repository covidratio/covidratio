import caseCount from './case-count.js';

function calculateRatio(population, cases) {
  const count = caseCount(cases);

  if (count === 0) {
    return count;
  }

  return Math.round(population / count);
}

export default calculateRatio;
