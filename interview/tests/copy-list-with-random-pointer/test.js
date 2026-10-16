// A spec is a list of [val, random index or null].
function buildRandomList(spec) {
  const nodes = spec.map(([v]) => new Node(v));
  spec.forEach(([, r], i) => {
    if (i + 1 < nodes.length) nodes[i].next = nodes[i + 1];
    if (r !== null) nodes[i].random = nodes[r];
  });
  return nodes.length ? nodes[0] : null;
}
function nodesOf(head) { const out = []; for (; head; head = head.next) out.push(head); return out; }
function describeRandomList(head) { // 'outside' marks a random pointer leaving the list
  const nodes = nodesOf(head);
  const index = new Map(nodes.map((node, i) => [node, i]));
  return nodes.map((node) => [node.val, node.random === null ? null : (index.has(node.random) ? index.get(node.random) : 'outside')]);
}

const randomCases = [[[4, 2], [8, null], [2, 0]], [[6, 0]], [[1, 1], [1, 0], [1, null]], [], [[1, null], [2, null], [3, null]],
  [[-10000, 4], [0, 4], [5, 4], [10000, 4], [7, 4]], [[3, 1], [9, 0]],
  Array.from({ length: 1000 }, (_, i) => [i - 500, i % 5 === 0 ? null : (i * 7) % 1000])];
randomCases.forEach((spec, n) => {
  const head = buildRandomList(spec);
  const originals = new Set(nodesOf(head));
  const copy = copyRandomList(head);
  check(describeRandomList(copy), spec, `case ${n} copy`);
  check(describeRandomList(head), spec, `case ${n} original changed`);
  check(nodesOf(copy).some((node) => originals.has(node)), false, `case ${n} copy shares nodes with the original`);
});
