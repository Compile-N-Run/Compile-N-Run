{
  const big = Array.from({ length: 50 }, (_, j) => { const v = []; for (let x = j; x < 5000; x += 50) v.push(x); return v; });
  for (const [lists, expected] of [[[[1, 4, 9], [2, 3], [5, 6, 10]], [1, 2, 3, 4, 5, 6, 9, 10]], [[[], [-3, 0]], [-3, 0]],
    [[[7], [7, 8]], [7, 7, 8]], [[], []], [[[]], []], [[[5]], [5]],
    [[[-2, -1], [-3], [0, 0], [], [-5, 10]], [-5, -3, -2, -1, 0, 0, 10]], [big, Array.from({ length: 5000 }, (_, i) => i)]]) {
    check(listValues(mergeKLists(lists.map(buildList))), expected, JSON.stringify(lists.slice(0, 5)));
  }
}
