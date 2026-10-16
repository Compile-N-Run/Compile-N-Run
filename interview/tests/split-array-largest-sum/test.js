{
  const ramp = [];
  for (let i = 1; i <= 1000; i++) ramp.push(i);
  const cases = [
    [[7, 2, 5, 10, 8], 2, 18],
    [[1, 2, 3, 4, 5], 2, 9],
    [[1, 4, 4], 3, 4],
    [[5], 1, 5],
    [[1, 1, 1, 1], 4, 1],
    [[0, 0, 0], 2, 0],
    [[10, 1, 1, 1, 10], 3, 10],
    [[2, 3, 1, 2, 4, 3], 5, 4],
    [ramp, 1, 500500],
    [ramp, 2, 250278],
    [new Array(1000).fill(1000000), 3, 334000000],
  ];
  for (const [nums, k, expected] of cases) {
    check(splitArray(nums.slice(), k), expected, `${nums.slice(0, 6)} k=${k}`);
  }
}
