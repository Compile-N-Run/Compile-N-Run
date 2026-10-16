{
  const big = Array.from({ length: 10000 }, (_, i) => (i % 3 === 0 ? 0 : i));
  const bigExpected = big.filter((x) => x !== 0).concat(big.filter((x) => x === 0));
  for (const [nums, expected] of [[[4, 0, 5, 0, 0, 9], [4, 5, 9, 0, 0, 0]], [[0, 0, 7], [7, 0, 0]], [[-3, 2], [-3, 2]], [[0], [0]],
    [[5], [5]], [[0, 0, 0], [0, 0, 0]], [[0, 1, 0, 3, 12], [1, 3, 12, 0, 0]], [[2, 0, 2, 0, -1], [2, 2, -1, 0, 0]], [big, bigExpected]]) {
    const arr = nums.slice();
    moveZeroes(arr);
    check(arr, expected, `${nums.slice(0, 10)}`);
  }
}
