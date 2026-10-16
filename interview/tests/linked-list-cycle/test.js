// Build the list and point the tail at node `pos` (-1 for no cycle).
function buildCycle(values, pos) {
  const head = buildList(values);
  if (pos >= 0) {
    let tail = head;
    let target = head;
    while (tail.next !== null) tail = tail.next;
    for (let i = 0; i < pos; i++) target = target.next;
    tail.next = target;
  }
  return head;
}

const bigList = Array.from({ length: 10000 }, (_, i) => i);
const cycleCases = [[[5, 8, 2, 9], 1, true], [[1, 2], 0, true], [[4, 4, 4], -1, false], [[7], 0, true], [[], -1, false],
  [[7], -1, false], [[1, 2, 3, 4, 5], 4, true], [[1, 2, 3, 4, 5, 6], -1, false], [[3, 3, 3, 3], 3, true],
  [bigList, -1, false], [bigList, 5000, true], [bigList, 0, true], [bigList, 9999, true]];
for (const [values, pos, expected] of cycleCases) {
  check(hasCycle(buildCycle(values, pos)), expected, `${JSON.stringify(values.slice(0, 6))} pos=${pos}`);
}
