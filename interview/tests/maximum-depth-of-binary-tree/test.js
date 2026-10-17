const depthChain = [0]; // 0 -> 1 -> ... -> 499 down the left side
for (let i = 1; i < 500; i++) depthChain.push(i, null);
const depthCases = [
  [[], 0],
  [[7], 1],
  [[5, 3, 8, null, 4], 3],
  [[1, null, 2, null, 3, null, 4], 4],
  [[1, 2, 3, 4, 5, 6, 7], 3],
  [[1, 2], 2],
  [[1, 2, 3, 4, 5, 6, 7, 8], 4],
  [[-1, -2, null, -3, null, null, -4], 4],
  [Array.from({ length: 1023 }, (_, i) => i + 1), 10], // complete tree of 1023 nodes
  [depthChain, 500],
];
for (const [values, expected] of depthCases) {
  check(maxDepth(buildTree(values)), expected, JSON.stringify(values.slice(0, 9)));
}
