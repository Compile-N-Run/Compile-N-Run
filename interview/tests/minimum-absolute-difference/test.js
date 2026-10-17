const evens = Array.from({ length: 1000 }, (_, i) => 2 * (999 - i)); // 1998, 1996, ..., 0: every neighbouring gap is 2
const squares = Array.from({ length: 1000 }, (_, i) => (999 - i) * (999 - i)); // only 0 and 1 are 1 apart
const madCases = [
  [[4, 2, 1, 3], [[1, 2], [2, 3], [3, 4]]],
  [[1, 3, 6, 10, 15], [[1, 3]]],
  [[3, 8, -10, 23, 19, -4, -14, 27], [[-14, -10], [19, 23], [23, 27]]],
  [[10, 1, 100, 7], [[7, 10]]],
  [[1, 2], [[1, 2]]],
  [[-5, 5], [[-5, 5]]],
  [[1000000, -1000000], [[-1000000, 1000000]]],
  [[-3, -1, -2], [[-3, -2], [-2, -1]]],
  [[40, 11, 26, 27, 10], [[10, 11], [26, 27]]],
  [evens, Array.from({ length: 999 }, (_, i) => [2 * i, 2 * i + 2])],
  [squares, [[0, 1]]],
];
for (const [arr, expected] of madCases) {
  const got = minimumAbsDifference(arr.slice());
  check(got, expected, `${JSON.stringify(arr.slice(0, 8))} (length ${arr.length})`);
}
