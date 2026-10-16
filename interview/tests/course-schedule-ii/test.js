// Any topological order is accepted; an impossible schedule must give [].
function valid(n, prereq, order, possible) {
  if (!possible) return order.length === 0;
  if (order.length !== n) return false;
  const pos = new Array(n).fill(-1);
  order.forEach((c, i) => { if (c >= 0 && c < n) pos[c] = i; });
  if (pos.includes(-1)) return false;
  return prereq.every(([a, b]) => pos[b] < pos[a]);
}
const chain = Array.from({ length: 1999 }, (_, i) => [i, i + 1]); // course i + 1 before course i
for (const [i, [n, prereq, possible]] of [[3, [[1, 0], [2, 1]], true], [4, [[1, 0], [2, 0], [3, 1], [3, 2]], true],
  [3, [[0, 2], [2, 0]], false], [3, [], true], [1, [], true], [3, [[0, 1], [1, 2], [2, 0]], false],
  [6, [[5, 4], [4, 3], [0, 5], [2, 1]], true], [2000, chain, true], [2000, chain.concat([[1999, 0]]), false]].entries()) {
  const got = findOrder(n, prereq.map((p) => p.slice()));
  check(valid(n, prereq, got, possible), true, `case ${i}: got ${JSON.stringify(got.slice(0, 10))}`);
}
