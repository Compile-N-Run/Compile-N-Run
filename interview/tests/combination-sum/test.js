const cmp = (a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i]; return a.length - b.length; };
const normalise = (combos) => combos.map((c) => c.slice().sort((a, b) => a - b)).sort(cmp);
for (const [candidates, target, expected] of [[[3, 4, 5], 8, [[3, 5], [4, 4]]], [[6, 3, 9], 9, [[3, 3, 3], [3, 6], [9]]],
  [[2], 6, [[2, 2, 2]]], [[5], 3, []], [[2, 3, 5], 12, [[2, 2, 2, 2, 2, 2], [2, 2, 2, 3, 3], [2, 2, 3, 5], [2, 5, 5], [3, 3, 3, 3]]],
  [[7], 7, [[7]]], [[40, 2], 1, []]]) {
  check(normalise(combinationSum(candidates.slice(), target)), expected, `${candidates} ${target}`);
}
// Larger case: 45 distinct combinations, each summing to 30 and using only the candidates.
const big = normalise(combinationSum([7, 3, 2, 5], 30));
check(big.length, 45, 'count for [7, 3, 2, 5] 30');
check(big.every((c) => c.reduce((s, x) => s + x, 0) === 30 && c.every((x) => [2, 3, 5, 7].includes(x))), true, 'valid combinations');
check(new Set(big.map((c) => c.join(','))).size, 45, 'no duplicates');
