function bruteCount(nums, k) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    let s = 0;
    for (let j = i; j < nums.length; j++) { s += nums[j]; if (s === k) total++; }
  }
  return total;
}
const big = []; let seed = 3;
for (let i = 0; i < 2000; i++) { seed = (seed * 48271) % 2147483647; big.push((seed % 21) - 10); }
for (const [nums, k, expected] of [[[1, 2, 3], 3, 2], [[1, 1, 1, 1], 2, 3], [[2, -2, 2, -2], 0, 4], [[5], 5, 1], [[5], 4, 0],
  [[-1, -1, 1], 0, 1], [[0, 0, 0], 0, 6], [[3, 4, 7, 2, -3, 1, 4, 2], 7, 4], [[1, -1, 0], 0, 3], [[-3, -2], -5, 1],
  [new Array(2000).fill(0), 0, 2001000], [big, 5, bruteCount(big, 5)]]) {
  check(subarraySum(nums.slice(), k), expected, `${nums.slice(0, 10)} k=${k}`);
}
