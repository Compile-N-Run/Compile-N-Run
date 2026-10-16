{
  const big = [];
  for (let v = 0; v < 100; v++) for (let i = 0; i <= v; i++) big.push(v); // value v appears v + 1 times
  for (const [nums, k, expected] of [[[5, 7, 5, 9, 7, 5], 2, [5, 7]], [[-3, -3, 4], 1, [-3]], [[8, 2, 6], 3, [2, 6, 8]],
    [[1], 1, [1]], [[4, 4, 4, 4], 1, [4]], [[-1, -1, 0, 0, 0, 2], 2, [-1, 0]], [big, 5, [95, 96, 97, 98, 99]]]) {
    check(topKFrequent(nums.slice(), k).sort((a, b) => a - b), expected, `${nums.slice(0, 10)} k=${k}`);
  }
}
