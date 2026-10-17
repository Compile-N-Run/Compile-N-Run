const INT_MIN = -(2 ** 31), INT_MAX = 2 ** 31 - 1;

function balanced(lo, hi) { // a perfectly balanced BST holding lo..hi
  if (lo > hi) return null;
  const mid = Math.floor((lo + hi) / 2);
  return new TreeNode(mid, balanced(lo, mid - 1), balanced(mid + 1, hi));
}

const bstChain = [1]; // 1 -> 2 -> ... -> 500 down the right side
for (let i = 2; i <= 500; i++) bstChain.push(null, i);
const bstDip = bstChain.slice();
bstDip[2 * 249] = 100; // node 250 is replaced by 100, which is smaller than its ancestors
const bstCases = [
  [[8, 3, 10], true],
  [[8, 3, 10, null, null, 6, 12], false],
  [[5, 5], false],
  [[INT_MAX], true],
  [[INT_MIN], true],
  [[INT_MIN, null, INT_MAX], true],
  [[INT_MAX, INT_MIN], true],
  [[INT_MIN, INT_MAX], false],
  [[3, 1, 5, 0, 2, 4, 6], true],
  [[3, 1, 5, 0, 4, 4, 6], false],
  [[10, 5, 15, null, null, 6, 20], false],
  [[10, 5, 15, null, null, 12, 20], true],
  [bstChain, true],
  [bstDip, false],
];
for (const [values, expected] of bstCases) {
  check(isValidBST(buildTree(values)), expected, JSON.stringify(values.slice(0, 7)));
}

const big = balanced(1, 4095);
check(isValidBST(big), true, 'balanced BST of 1..4095');
let node = big;
while (node.left) node = node.left;
node.val = 5000; // the leftmost leaf now exceeds every ancestor
check(isValidBST(big), false, 'balanced BST of 1..4095 with leftmost leaf set to 5000');
