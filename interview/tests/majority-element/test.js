{
  const cases = [[[2, 7, 2], 2], [[5], 5], [[-1, -1, 4, 4, -1], -1], [[3, 3, 8, 8, 3, 8, 8], 8],
    [[1e9, -1e9, 1e9], 1e9], [[0, 0, 0, 0], 0], [[1, 2, 1, 3, 1, 4, 1], 1]];
  // Larger case: 25001 copies of -7 interleaved with 24999 distinct other values.
  const big = [];
  for (let i = 0; i < 25000; i++) big.push(-7, i);
  big[big.length - 1] = -7;
  big.push(99);
  cases.push([big, -7]);
  for (const [nums, expected] of cases) check(majorityElement(nums.slice()), expected, `${nums.slice(0, 8)}`);
}
