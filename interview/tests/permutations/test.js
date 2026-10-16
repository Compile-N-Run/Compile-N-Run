const cmp = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
for (const [nums, expected] of [[[4, 9], [[4, 9], [9, 4]]],
  [[1, 2, 3], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]],
  [[-5], [[-5]]], [[0, -10], [[-10, 0], [0, -10]]]]) {
  check(permute(nums.slice()).sort(cmp), expected, `${nums}`);
}
for (const [nums, count] of [[[0, -1, 7, 2], 24], [[6, -2, 3, 10, -8, 1], 720]]) {
  const got = permute(nums.slice());
  const target = JSON.stringify(nums.slice().sort((a, b) => a - b));
  check(got.length, count, `count ${nums}`);
  check(new Set(got.map((p) => JSON.stringify(p))).size, count, `distinct ${nums}`);
  check(got.every((p) => JSON.stringify(p.slice().sort((a, b) => a - b)) === target), true, `each is a permutation ${nums}`);
}
