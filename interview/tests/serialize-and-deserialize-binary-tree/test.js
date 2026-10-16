function sameTree(a, b) {
  if (a === null || b === null) return a === b;
  return a.val === b.val && sameTree(a.left, b.left) && sameTree(a.right, b.right);
}

const codecChain = [0]; // 0 -> 1 -> ... -> 499 down the left side
for (let i = 1; i < 500; i++) codecChain.push(i, null);
const codecFull = Array.from({ length: 1023 }, (_, i) => i + 1); // complete tree of 1023 nodes
const codecCases = [
  [],
  [1],
  [1, 2, 3, null, null, 4, 5],
  [-5, null, 7],
  [100, 20, 300],
  [0, 0, 0],
  [1, null, 2, null, 3],
  [-1, -2, -3, -4, null, null, -5],
  [2147483647, -2147483648],
  [7, 7, null, 7, null, 7],
  codecChain,
  codecFull,
];
for (const values of codecCases) {
  const root = buildTree(values);
  const data = serialize(root);
  check(typeof data, 'string', `${JSON.stringify(values.slice(0, 8))}: serialize must return a string`);
  const got = deserialize(data);
  check(sameTree(got, buildTree(values)), true, `${JSON.stringify(values.slice(0, 8))} (n=${values.length}): round trip changed the tree`);
  if (root !== null) check(got !== root, true, `${JSON.stringify(values.slice(0, 8))}: deserialize must build a new tree`);
  // The rebuilt tree must serialize and rebuild again just as well.
  const again = deserialize(serialize(got));
  check(sameTree(again, buildTree(values)), true, `${JSON.stringify(values.slice(0, 8))} (n=${values.length}): second round trip`);
}
