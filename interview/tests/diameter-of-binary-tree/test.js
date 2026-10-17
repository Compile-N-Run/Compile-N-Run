const diamFull = Array.from({ length: 1023 }, (_, i) => i + 1); // complete tree of 1023 nodes: 9 edges down each side
const diamChain = [0]; // 0 -> 1 -> ... -> 999 down the left side
for (let i = 1; i < 1000; i++) diamChain.push(i, null);
const diamCases = [
  [[1, 2, 3, 4, 5], 3],
  [[1], 0],
  [[1, null, 2], 1],
  [[1, 2, null, 3, 4, 5, null, null, 6, 7], 5], // longest path avoids the root
  [[1, 2, 3], 2],
  [[1, 2, null, 3, null, 4], 3], // a chain of four
  [[1, 2, 3, 4, 5, 6, 7], 4],
  [[1, 2, 3, 4, null, null, 5], 4],
  [[-7, -7, -7, null, 3], 3], // values do not matter
  [[], 0], // no tree at all
  [diamFull, 18],
  [diamChain, 999],
];
for (const [values, expected] of diamCases) {
  const got = diameterOfBinaryTree(buildTree(values));
  check(got, expected, `tree=${JSON.stringify(values.slice(0, 10))}${values.length > 10 ? '...' : ''} (${values.length} entries)`);
}
