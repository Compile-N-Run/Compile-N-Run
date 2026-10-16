const nines = new Array(100).fill(9), bigSum = new Array(100).fill(0).concat([1]);
const seq = [], seqDouble = []; // 1234567890 repeated 10 times, ones digit first, and its double
for (let i = 0; i < 10; i++) seq.push(0, 9, 8, 7, 6, 5, 4, 3, 2, 1);
let carryIn = 0;
for (const d of seq) { const s = 2 * d + carryIn; seqDouble.push(s % 10); carryIn = Math.floor(s / 10); }
if (carryIn) seqDouble.push(carryIn);
for (const [a, b, expected] of [[[2, 1, 5], [8, 4], [0, 6, 5]], [[9, 9], [1], [0, 0, 1]], [[0], [0], [0]], [[3], [4], [7]],
  [[1], [9, 9, 9, 9], [0, 0, 0, 0, 1]], [[5], [5], [0, 1]], [[1, 0, 1], [2, 3], [3, 3, 1]],
  [nines, [1], bigSum], [seq, seq, seqDouble]]) {
  check(listValues(addTwoNumbers(buildList(a), buildList(b))), expected, `${a.slice(0, 10)} + ${b.slice(0, 10)}`);
}
