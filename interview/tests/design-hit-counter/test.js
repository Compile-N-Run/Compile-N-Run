// Each op is [0, timestamp, 0] for hit or [1, timestamp, expected] for getHits.
const hitCases = [
  [[0, 2, 0], [0, 2, 0], [0, 5, 0], [1, 5, 3], [1, 301, 3], [1, 302, 1], [1, 305, 0]],
  [[1, 1, 0], [1, 100, 0]],
  [[0, 1, 0], [1, 300, 1], [1, 301, 0]],
  [[0, 10, 0], [0, 10, 0], [0, 10, 0], [0, 10, 0], [0, 10, 0], [1, 10, 5], [1, 309, 5], [1, 310, 0]],
  [[0, 1, 0], [0, 100, 0], [0, 250, 0], [1, 350, 2], [0, 400, 0], [1, 400, 2], [1, 549, 2], [1, 550, 1]],
  [[1, 5, 0], [0, 5, 0], [1, 5, 1], [0, 6, 0], [0, 6, 0], [1, 304, 3], [1, 305, 2], [1, 306, 0]],
];
const bigHits = [];
for (let t = 1; t <= 10000; t++) bigHits.push([0, t, 0], [1, t, Math.min(t, 300)]);
bigHits.push([1, 20000, 0]);
hitCases.push(bigHits);
hitCases.forEach((ops, n) => {
  const counter = new HitCounter();
  ops.forEach(([op, t, expected], step) => {
    if (op === 0) counter.hit(t);
    else check(counter.getHits(t), expected, `case ${n} step ${step} getHits(${t})`);
  });
});
