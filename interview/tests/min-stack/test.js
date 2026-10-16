// Each op is [0, value] for push, [1, 0] for pop, [2, expected] for top or [3, expected] for getMin.
const bigOps = [];
for (let v = 1000; v >= 1; v--) bigOps.push([0, v]);
for (let v = 1; v < 1000; v++) bigOps.push([3, v], [2, v], [1, 0]);
bigOps.push([3, 1000]);
for (let v = 2000; v < 3000; v++) bigOps.push([0, v]);
bigOps.push([3, 1000], [2, 2999]);
const stackCases = [
  [[0, 4], [0, 2], [0, 7], [3, 2], [2, 7], [1, 0], [1, 0], [3, 4], [2, 4]],
  [[0, 3], [0, 3], [1, 0], [3, 3], [2, 3]],
  [[0, -1], [0, 5], [3, -1], [2, 5]],
  [[0, 9], [3, 9], [2, 9]],
  [[0, -2147483648], [0, 2147483647], [3, -2147483648], [2, 2147483647], [1, 0], [2, -2147483648]],
  [[0, 1], [0, 2], [0, 0], [3, 0], [1, 0], [3, 1], [0, -3], [3, -3], [1, 0], [1, 0], [3, 1], [2, 1]],
  [[0, 5], [1, 0], [0, 8], [3, 8], [0, 6], [3, 6], [2, 6]],
  bigOps,
];
stackCases.forEach((ops, n) => {
  const stack = new MinStack();
  ops.forEach(([op, x], step) => {
    if (op === 0) stack.push(x);
    else if (op === 1) stack.pop();
    else if (op === 2) check(stack.top(), x, `case ${n} step ${step} top`);
    else check(stack.getMin(), x, `case ${n} step ${step} getMin`);
  });
});
