{
  const cases = [[[10, 20, 30, 40, 50, 60, 70], 3, [30, 20, 10, 60, 50, 40, 70]], [[1, 2, 3, 4], 4, [4, 3, 2, 1]],
    [[5, 6, 7, 8, 9], 2, [6, 5, 8, 7, 9]], [[1, 2, 3], 1, [1, 2, 3]], [[42], 1, [42]],
    [[1, 2, 3, 4, 5, 6], 3, [3, 2, 1, 6, 5, 4]], [[0, 0, 1, 1, 2], 2, [0, 0, 1, 1, 2]]];
  // Larger cases: 5000 nodes in groups of 7 (2 left over) and one group of 5000.
  const big = Array.from({ length: 5000 }, (_, i) => i);
  const expected7 = [];
  for (let i = 0; i < 5000; i += 7) {
    const chunk = big.slice(i, i + 7);
    expected7.push(...(chunk.length === 7 ? chunk.reverse() : chunk));
  }
  cases.push([big, 7, expected7], [big, 5000, big.slice().reverse()]);
  for (const [values, k, expected] of cases) {
    check(listValues(reverseKGroup(buildList(values), k)), expected, `${values.slice(0, 8)} k=${k}`);
  }
}
