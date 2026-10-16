{
  const normalise = (ts) => ts.map((t) => t.slice().sort((a, b) => a - b))
    .sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
  // Larger case: values -6..6, each at least 15 times, so every value triple summing to 0 is present.
  const big = Array.from({ length: 200 }, (_, i) => (i * 7) % 13 - 6);
  const bigExpected = [];
  for (let a = -6; a <= 6; a++) for (let b = a; b <= 6; b++) if (b <= -a - b && -a - b <= 6) bigExpected.push([a, b, -a - b]);
  for (const [nums, expected] of [[[-4, 1, 3, 2, -1, -2], [[-4, 1, 3], [-2, -1, 3]]], [[-2, 1, 1, -2, 4, 0], [[-2, -2, 4], [-2, 1, 1]]],
    [[0, 0, 0, 0], [[0, 0, 0]]], [[2, 5, -1], []], [[-2, 0, 0, 2, 2], [[-2, 0, 2]]],
    [[-1, 0, 1, 2, -1, -4], [[-1, -1, 2], [-1, 0, 1]]], [[1, 2, -2, -1], []], [big, bigExpected]]) {
    check(normalise(threeSum(nums.slice())), normalise(expected), `${nums.slice(0, 10)}`);
  }
}
