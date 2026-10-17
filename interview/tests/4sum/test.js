function normalise(quads) { // any order is valid: sort inside each quadruplet and sort the list
  return quads.map((q) => q.slice().sort((a, b) => a - b))
    .sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2] || p[3] - q[3]);
}

const mod10 = Array.from({ length: 200 }, (_, i) => i % 10);
const mod10Want = [];
for (let a = 0; a < 10; a++) for (let b = a; b < 10; b++) for (let c = b; c < 10; c++) for (let d = c; d < 10; d++) {
  if (a + b + c + d === 18) mod10Want.push([a, b, c, d]);
}
const fourSumCases = [
  [[1, 0, -1, 0, -2, 2], 0, [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]],
  [[2, 2, 2, 2, 2], 8, [[2, 2, 2, 2]]],
  [[-3, -1, 0, 2, 4, 5], 2, [[-3, -1, 2, 4]]],
  [[1, 2, 3], 6, []],
  [[], 0, []],
  [[0, 0, 0, 0], 0, [[0, 0, 0, 0]]],
  [[0, 0, 0, 0], 1, []],
  [[-5, -4, -3, -2, -1], -10, [[-4, -3, -2, -1]]],
  [[1, -2, -5, -4, -3, 3, 3, 5], -11, [[-5, -4, -3, 1]]],
  [[1000000000, 1000000000, 1000000000, 1000000000], -294967296, []], // a 32-bit sum wraps to the target
  [[-1000000000, -1000000000, 1000000000, 1000000000], 0, [[-1000000000, -1000000000, 1000000000, 1000000000]]],
  [mod10, 18, mod10Want],
];
for (const [nums, target, expected] of fourSumCases) {
  const got = fourSum(nums.slice(), target);
  check(normalise(got), expected, `${JSON.stringify(nums.slice(0, 8))} (length ${nums.length}) target ${target}`);
}

const distinct = Array.from({ length: 100 }, (_, i) => i - 50); // 100 distinct values: 26536 quadruplets sum to 0
const got = fourSum(distinct.slice(), 0);
check(got.length, 26536, 'range(-50, 50) target 0: number of quadruplets');
const keys = new Set(got.map((q) => q.slice().sort((a, b) => a - b).join(',')));
check(keys.size === got.length && got.every((q) => q[0] + q[1] + q[2] + q[3] === 0), true,
  'range(-50, 50) target 0: all distinct and each sums to 0');
