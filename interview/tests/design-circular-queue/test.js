// Each op is [0, value, expected] for enQueue, [1, 0, expected] for deQueue, [2, 0, expected] for Front,
// [3, 0, expected] for Rear, [4, 0, expected] for isEmpty or [5, 0, expected] for isFull; booleans are 1/0.
const bigOps = [];
for (let v = 0; v < 1000; v++) bigOps.push([0, v, 1]);
bigOps.push([0, 1000, 0], [5, 0, 1]);
for (let i = 0; i < 500; i++) bigOps.push([1, 0, 1]);
bigOps.push([2, 0, 500], [3, 0, 999]);
for (let v = 1000; v < 1500; v++) bigOps.push([0, v, 1]);
bigOps.push([3, 0, 1499], [5, 0, 1], [0, 9, 0]);
for (let i = 0; i < 1000; i++) bigOps.push([1, 0, 1]);
bigOps.push([1, 0, 0], [4, 0, 1], [2, 0, -1], [3, 0, -1]);
const queueCases = [
  [3, [[0, 4, 1], [0, 9, 1], [0, 2, 1], [0, 7, 0], [5, 0, 1], [1, 0, 1], [2, 0, 9], [0, 7, 1], [3, 0, 7], [4, 0, 0]]],
  [1, [[2, 0, -1], [3, 0, -1], [1, 0, 0], [4, 0, 1], [0, 5, 1], [5, 0, 1], [0, 6, 0], [2, 0, 5], [3, 0, 5], [1, 0, 1], [4, 0, 1],
    [2, 0, -1], [0, 8, 1], [3, 0, 8]]],
  [2, [[0, 1, 1], [0, 2, 1], [1, 0, 1], [0, 3, 1], [2, 0, 2], [3, 0, 3], [5, 0, 1], [1, 0, 1], [1, 0, 1], [1, 0, 0], [4, 0, 1],
    [0, 7, 1], [2, 0, 7], [3, 0, 7]]],
  [4, [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [5, 0, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [4, 0, 1], [0, 5, 1],
    [0, 6, 1], [2, 0, 5], [3, 0, 6], [1, 0, 1], [2, 0, 6], [3, 0, 6]]],
  [3, [[0, 0, 1], [0, 0, 1], [2, 0, 0], [3, 0, 0], [1, 0, 1], [3, 0, 0], [2, 0, 0], [0, 1000, 1], [3, 0, 1000], [5, 0, 0], [0, 2, 1], [5, 0, 1]]],
  [3, [[0, 1, 1], [0, 2, 1], [0, 3, 1], [1, 0, 1], [0, 4, 1], [2, 0, 2], [3, 0, 4], [1, 0, 1], [0, 5, 1], [2, 0, 3], [3, 0, 5],
    [1, 0, 1], [0, 6, 1], [2, 0, 4], [3, 0, 6], [1, 0, 1], [0, 7, 1], [2, 0, 5], [3, 0, 7]]],
  [1000, bigOps],
];
queueCases.forEach(([k, ops], n) => {
  const queue = new MyCircularQueue(k);
  ops.forEach(([op, value, expected], step) => {
    const label = `case ${n} step ${step} op ${op}`;
    if (op === 0) check(queue.enQueue(value), expected === 1, label);
    else if (op === 1) check(queue.deQueue(), expected === 1, label);
    else if (op === 2) check(queue.Front(), expected, label);
    else if (op === 3) check(queue.Rear(), expected, label);
    else if (op === 4) check(queue.isEmpty(), expected === 1, label);
    else check(queue.isFull(), expected === 1, label);
  });
});
