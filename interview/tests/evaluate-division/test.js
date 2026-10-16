const chain = []; for (let i = 0; i < 19; i++) chain.push([`v${i}`, `v${i + 1}`]);
for (const [equations, values, queries, expected] of [
  [[['a', 'b'], ['b', 'c']], [3, 0.5], [['a', 'c'], ['c', 'a'], ['b', 'b'], ['a', 'z']], [1.5, 2 / 3, 1, -1]],
  [[['p', 'q'], ['r', 's']], [4, 2], [['p', 's'], ['q', 'p'], ['s', 'r']], [-1, 0.25, 0.5]],
  [[['x', 'y']], [5], [['x', 'x'], ['w', 'w'], ['y', 'x']], [1, -1, 0.2]],
  [[['ab', 'cd'], ['cd', 'ef'], ['ab', 'gh']], [2, 3, 4], [['ef', 'gh'], ['gh', 'cd']], [4 / 6, 0.5]],
  [[['a', 'b'], ['b', 'c'], ['c', 'a']], [2, 3, 1 / 6], [['a', 'c'], ['c', 'b']], [6, 1 / 3]],
  [chain, Array(19).fill(2), [['v0', 'v19'], ['v19', 'v0'], ['v5', 'v10'], ['v3', 'v20']], [524288, 1 / 524288, 32, -1]],
]) {
  const got = calcEquation(equations, values, queries);
  const ok = got.length === expected.length && got.every((g, i) => Math.abs(g - expected[i]) <= 1e-5 * Math.max(1, Math.abs(expected[i])));
  check(ok ? expected : got, expected, JSON.stringify(equations));
}
