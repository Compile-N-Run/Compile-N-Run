function bruteWindowMax(nums, k) {
  const out = [];
  for (let i = 0; i + k <= nums.length; i++) out.push(Math.max(...nums.slice(i, i + k)));
  return out;
}
function generateNums(n, seed) {
  const out = []; let x = seed;
  for (let i = 0; i < n; i++) { x = (x * 48271) % 2147483647; out.push((x % 2001) - 1000); }
  return out;
}
const big = generateNums(5000, 7);
for (const [nums, k, expected] of [[[2, 5, 1, 3, 4, 0], 3, [5, 5, 4, 4]], [[6, 4, 2], 1, [6, 4, 2]], [[-3, -1, -7, -2], 4, [-1]],
  [[1, 3, 3, 2], 2, [3, 3, 3]], [[1, 3, -1, -3, 5, 3, 6, 7], 3, [3, 3, 5, 5, 6, 7]], [[9, 8, 7, 6, 5], 2, [9, 8, 7, 6]],
  [[4], 1, [4]], [[7, 7, 7, 7], 3, [7, 7]], [big, 137, bruteWindowMax(big, 137)]]) {
  check(maxSlidingWindow(nums.slice(), k), expected, `${nums.slice(0, 10)} k=${k}`);
}
