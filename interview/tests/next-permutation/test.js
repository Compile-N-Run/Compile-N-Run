const asc = Array.from({ length: 1000 }, (_, i) => i);
const ascNext = [...asc.slice(0, 998), 999, 998];
const desc = [...asc].reverse();
const permCases = [[[1, 3, 2], [2, 1, 3]], [[5, 4, 3], [3, 4, 5]], [[2, 2, 7], [2, 7, 2]],
  [[1, 5, 8, 4, 7, 6, 5, 3, 1], [1, 5, 8, 5, 1, 3, 4, 6, 7]], [[1], [1]], [[1, 1], [1, 1]], [[1, 2], [2, 1]],
  [[3, 1, 2], [3, 2, 1]], [[1, 5, 1], [5, 1, 1]], [[2, 3, 1, 3, 3], [2, 3, 3, 1, 3]], [[0, -1, 4], [0, 4, -1]],
  [asc, ascNext], [desc, asc]];
for (const [nums, expected] of permCases) {
  const arr = [...nums];
  nextPermutation(arr);
  check(arr, expected, `size ${nums.length} ${nums.slice(0, 6)}`);
}
