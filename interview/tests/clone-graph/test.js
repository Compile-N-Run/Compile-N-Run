// adj[i] lists the (1-based) neighbours of node i + 1. Returns node 1, or null for an empty graph.
function buildGraph(adj) {
  const nodes = adj.map((_, i) => new Node(i + 1));
  adj.forEach((neighbours, i) => { nodes[i].neighbors = neighbours.map((j) => nodes[j - 1]); });
  return nodes.length ? nodes[0] : null;
}
function graphNodes(start) { // every node reachable from start, each object once
  const seen = new Set();
  const stack = start ? [start] : [];
  while (stack.length) {
    const node = stack.pop();
    if (seen.has(node)) continue;
    seen.add(node);
    stack.push(...node.neighbors);
  }
  return [...seen];
}
function describeGraph(start) { // back to an adjacency list; a string says what is wrong when values are not 1..n once each
  const nodes = graphNodes(start);
  const byVal = new Map();
  for (const node of nodes) {
    if (byVal.has(node.val)) return `two nodes with value ${node.val}`;
    byVal.set(node.val, node);
  }
  const values = [...byVal.keys()].sort((a, b) => a - b);
  if (values.some((v, i) => v !== i + 1)) return `values ${JSON.stringify(values)}`;
  return values.map((v) => byVal.get(v).neighbors.map((nb) => nb.val));
}
function ringWithChords(n) { // node i joined to its two ring neighbours and to the node opposite it
  return Array.from({ length: n }, (_, k) => { const i = k + 1; return [((i - 2 + n) % n) + 1, (i % n) + 1, ((i + n / 2 - 1) % n) + 1]; });
}

const graphCases = [
  [[2, 4], [1, 3], [2, 4], [1, 3]], // a square
  [[]], // a single node
  [], // empty graph
  [[2], [1]],
  [[2, 3], [1, 3], [1, 2]], // a triangle
  [[2], [1, 3], [2, 4], [3, 5], [4]], // a path
  [[2, 3, 4, 5, 6], [1], [1], [1], [1], [1]], // a star
  [[2, 3, 4], [1, 3], [1, 2, 4], [1, 3]],
  ringWithChords(100), // the largest allowed graph
];
for (const adj of graphCases) {
  const start = buildGraph(adj);
  const originals = new Set(graphNodes(start));
  const clone = cloneGraph(start);
  const label = `graph=${JSON.stringify(adj.slice(0, 4))}${adj.length > 4 ? '...' : ''} (${adj.length} nodes)`;
  if (!adj.length) {
    check(clone, null, `${label} clone`);
    continue;
  }
  check(describeGraph(clone), adj, `${label} clone`);
  check(describeGraph(start), adj, `${label} original changed`);
  check(graphNodes(clone).some((node) => originals.has(node)), false, `${label} clone shares nodes with the original`);
}
