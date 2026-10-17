const zigFull = Array.from({ length: 1023 }, (_, i) => i + 1); // complete tree of 1023 nodes: level d holds 2^d .. 2^(d+1) - 1
const zigFullWant = [];
for (let d = 0; d < 10; d++) {
  const level = Array.from({ length: 2 ** d }, (_, i) => 2 ** d + i);
  zigFullWant.push(d % 2 ? level.reverse() : level);
}
const zigChain = [0]; // 0 -> 1 -> ... -> 299 down the left side
for (let i = 1; i < 300; i++) zigChain.push(i, null);
const zigCases = [
  [[], []],
  [[8], [[8]]],
  [[1, 2, 3, 4, 5, 6, 7], [[1], [3, 2], [4, 5, 6, 7]]],
  [[4, 2, 7, 1, null, null, 9], [[4], [7, 2], [1, 9]]],
  [[1, 2, null, 3, null, 4], [[1], [2], [3], [4]]],
  [[1, null, 2, null, 3], [[1], [2], [3]]],
  [[1, 2, 3, 4, null, null, 5, null, 6, 7], [[1], [3, 2], [4, 5], [7, 6]]],
  [[0, -1, -2, -3, -4, -5, -6, -7], [[0], [-2, -1], [-3, -4, -5, -6], [-7]]],
  [zigFull, zigFullWant],
  [zigChain, Array.from({ length: 300 }, (_, i) => [i])],
];
for (const [values, expected] of zigCases) {
  check(zigzagLevelOrder(buildTree(values)), expected, JSON.stringify(values.slice(0, 10)));
}
