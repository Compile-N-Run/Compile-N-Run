{
  const alternating = [];
  for (let i = 0; i < 5000; i++) alternating.push(1, 0);
  const cases = [
    [[1, 1, 0, 0, 1, 1, 1, 0, 1], 2, 7],
    [[0, 0, 0], 1, 1],
    [[0, 0, 0], 0, 0],
    [[1, 1, 1], 0, 3],
    [[1, 0, 1, 0, 1], 5, 5],
    [[1], 0, 1],
    [[0], 0, 0],
    [[0], 1, 1],
    [[1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1], 2, 7],
    [[0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1], 0, 3],
    [alternating, 100, 201],
    [new Array(10000).fill(1), 0, 10000],
    [new Array(10000).fill(0), 10000, 10000],
  ];
  for (const [nums, k, expected] of cases) {
    check(longestOnes(nums.slice(), k), expected, `${nums.slice(0, 12)} k=${k}`);
  }
}
