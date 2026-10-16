function findNode(root, val) {
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (node === null) continue;
    if (node.val === val) return node;
    stack.push(node.left, node.right);
  }
  throw new Error(`${val} not in tree`);
}

const lcaExample = [10, 4, 15, 1, 7, null, 20, null, null, 6, 9];
const lcaFull = Array.from({ length: 1023 }, (_, i) => i + 1); // complete tree of 1023 nodes
const lcaChain = [0]; // 0 -> 1 -> ... -> 499 down the left side
for (let i = 1; i < 500; i++) lcaChain.push(i, null);
const lcaCases = [[lcaExample, 6, 9, 7], [lcaExample, 1, 9, 4], [lcaExample, 4, 6, 4], [lcaExample, 9, 20, 10],
  [lcaExample, 15, 20, 15], [[1, 2], 1, 2, 1], [[1, 2], 2, 1, 1], [[0, -5, 8, null, -3], -3, 8, 0],
  [lcaFull, 1000, 1023, 31], [lcaFull, 1000, 1001, 500], [lcaFull, 960, 975, 60], [lcaChain, 499, 200, 200]];
for (const [values, p, q, expected] of lcaCases) {
  const root = buildTree(values);
  const got = lowestCommonAncestor(root, findNode(root, p), findNode(root, q));
  check(got === findNode(root, expected), true, `p=${p} q=${q} got ${got ? got.val : null}`);
}
