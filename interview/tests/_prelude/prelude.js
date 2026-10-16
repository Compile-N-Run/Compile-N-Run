// Shared definitions available to every JavaScript solution.
function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
function TreeNode(val, left, right) { this.val = val === undefined ? 0 : val; this.left = left === undefined ? null : left; this.right = right === undefined ? null : right; }
function buildList(values) { const head = new ListNode(); let tail = head; for (const v of values) { tail.next = new ListNode(v); tail = tail.next; } return head.next; }
function listValues(node) { const out = []; while (node) { out.push(node.val); node = node.next; } return out; }
function buildTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]); const queue = [root]; let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift();
    if (i < values.length && values[i] !== null) { node.left = new TreeNode(values[i]); queue.push(node.left); } i++;
    if (i < values.length && values[i] !== null) { node.right = new TreeNode(values[i]); queue.push(node.right); } i++;
  }
  return root;
}
function check(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error(`${label || ''}: expected ${e}, got ${a}`); process.exit(1); }
}
