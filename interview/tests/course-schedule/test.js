const chain = Array.from({ length: 1999 }, (_, i) => [i + 1, i]);
for (const [n, prereq, expected] of [[3, [[1, 0], [2, 1]], true], [2, [[0, 1], [1, 0]], false], [4, [], true],
  [4, [[1, 0], [2, 1], [3, 2], [1, 3]], false], [1, [], true], [5, [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]], true],
  [3, [[0, 1], [1, 2], [2, 0]], false], [2000, chain, true], [2000, chain.concat([[0, 1999]]), false]]) {
  check(canFinish(n, prereq.map((p) => p.slice())), expected, `${n} ${JSON.stringify(prereq.slice(0, 5))}`);
}
