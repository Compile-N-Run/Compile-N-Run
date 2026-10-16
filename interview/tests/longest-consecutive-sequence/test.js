const big = [];
for (let i = 99999; i >= 0; i -= 2) big.push(i);
for (let i = 0; i < 100000; i += 2) big.push(i);
big.push(200000, -5);
for (const [nums, expected] of [[[10, 4, 20, 1, 3, 2], 4], [[5, -1, 0, 7, 1, 6, 1], 3], [[42], 1], [[], 0],
  [[7, 7, 7], 1], [[1, 3, 5, 7], 1], [[-1000000000, 1000000000, 0, -999999999], 2],
  [[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6], 7], [big, 100000]]) {
  check(longestConsecutive(nums.slice()), expected, `${nums.slice(0, 10)}`);
}
