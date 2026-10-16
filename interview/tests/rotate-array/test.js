{
  const n = 100000;
  const big = Array.from({ length: n }, (_, i) => i);
  const bigExpected = big.map((i) => (i - 23456 + n) % n); // k = 123456 is 23456 after wrapping
  for (const [nums, k, expected] of [[[10, 20, 30, 40, 50], 2, [40, 50, 10, 20, 30]], [[1, 2, 3], 4, [3, 1, 2]], [[-5, 8], 0, [-5, 8]],
    [[9], 7, [9]], [[1, 2, 3, 4], 4, [1, 2, 3, 4]], [[1, 2, 3, 4, 5, 6, 7], 3, [5, 6, 7, 1, 2, 3, 4]], [[1, 2], 1, [2, 1]],
    [[4, 4, 1, 4], 3, [4, 1, 4, 4]], [big, 123456, bigExpected]]) {
    const arr = nums.slice();
    check(rotate(arr, k) === undefined, true, "returns nothing");
    check(arr, expected, `${nums.slice(0, 10)} k=${k}`);
  }
}
