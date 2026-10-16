{
  const big = Array.from({ length: 100000 }, (_, i) => ((i * 7919) % 20001) - 10000);
  const desc = big.slice().sort((a, b) => b - a);
  for (const [nums, k, expected] of [[[7, 2, 9, 4], 2, 7], [[5, 5, 1], 2, 5], [[-1, -8, -3], 3, -8], [[6], 1, 6],
    [[1, 2, 3, 4, 5], 1, 5], [[3, 3, 3, 3], 3, 3], [[10, -10, 0], 2, 0], [big, 500, desc[499]], [big, 100000, desc[99999]]]) {
    check(findKthLargest(nums.slice(), k), expected, `${nums.slice(0, 6)} k=${k}`);
  }
}
