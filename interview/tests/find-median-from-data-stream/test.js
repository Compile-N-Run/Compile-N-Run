// Each sequence is a list of operations: ['add', num] or ['med', expected median].
const sequences = [
  [['add', 4], ['med', 4], ['add', 10], ['med', 7], ['add', 1], ['med', 4], ['add', 7], ['med', 5.5]],
  [['add', -5], ['med', -5]],
  [['add', 3], ['add', 3], ['add', 3], ['med', 3], ['add', 3], ['med', 3]],
  [['add', 5], ['med', 5], ['add', 4], ['med', 4.5], ['add', 3], ['med', 4], ['add', 2], ['med', 3.5], ['add', 1], ['med', 3]],
  [['add', -100000], ['add', 100000], ['med', 0], ['add', 0], ['med', 0]],
  [['add', 2], ['med', 2], ['med', 2], ['add', 8], ['med', 5], ['med', 5]],
];
{
  const big = [], ref = []; let x = 11;
  for (let i = 0; i < 3000; i++) {
    x = (x * 48271) % 2147483647;
    const num = (x % 200001) - 100000;
    let pos = ref.findIndex((v) => v > num); if (pos < 0) pos = ref.length;
    ref.splice(pos, 0, num);
    const t = ref.length;
    big.push(['add', num], ['med', t % 2 ? ref[t >> 1] : (ref[t / 2 - 1] + ref[t / 2]) / 2]);
  }
  sequences.push(big);
}
sequences.forEach((ops, s) => {
  const finder = new MedianFinder();
  ops.forEach(([op, value], step) => {
    if (op === 'add') { finder.addNum(value); return; }
    const got = finder.findMedian();
    if (!(Math.abs(got - value) <= 1e-6)) { console.error(`sequence ${s} step ${step}: expected ${value}, got ${got}`); process.exit(1); }
  });
});
