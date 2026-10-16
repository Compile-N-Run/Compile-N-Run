const bruteProduct = (nums) => nums.map((_, i) => nums.reduce((p, x, j) => (j === i ? p : p * x), 1));
const bigNums = Array.from({ length: 1000 }, (_, i) => (i % 100 === 0 ? 2 : i % 7 === 0 ? -1 : 1));
for (const [nums, expected] of [[[2, 3, 4, 5], [60, 40, 30, 24]], [[3, 0, 4], [0, 12, 0]], [[0, 5, 0], [0, 0, 0]],
  [[-1, 2, -3], [-6, 3, -2]], [[7, 9], [9, 7]], [[0, 0], [0, 0]], [[1, 1, 1, 1], [1, 1, 1, 1]], [bigNums, bruteProduct(bigNums)]]) {
  // JSON.stringify(-0) is "0", so a negative zero still compares equal.
  check(productExceptSelf(nums.slice()), expected, `${nums.slice(0, 10)}`);
}
