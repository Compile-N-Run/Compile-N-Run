const evens = [], odds = [], all = [];
for (let i = -100; i < 100; i += 2) evens.push(i);
for (let i = -99; i < 101; i += 2) odds.push(i);
for (let i = -100; i < 100; i++) all.push(i);
for (const [a, b, expected] of [[[2, 5, 9], [1, 6], [1, 2, 5, 6, 9]], [[3, 3, 4], [3], [3, 3, 3, 4]], [[], [7, 8], [7, 8]],
  [[], [], []], [[1, 2, 3], [], [1, 2, 3]], [[-5, 0], [-10, -5, 20], [-10, -5, -5, 0, 20]], [[1], [2], [1, 2]],
  [[10, 11, 12], [1, 2, 3], [1, 2, 3, 10, 11, 12]], [evens, odds, all]]) {
  check(listValues(mergeTwoLists(buildList(a), buildList(b))), expected, `${a} + ${b}`);
}
