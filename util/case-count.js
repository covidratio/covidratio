function caseCount(cases) {
  return cases ? cases.reduce((sum, count) => sum + count, 0) : 0;
}

export default caseCount;
