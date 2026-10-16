const jobCases = [
  [[1, 2, 4], [3, 5, 6], [50, 10, 70], 120],
  [[1, 1, 1], [2, 3, 4], [5, 6, 4], 6],
  [[1, 3, 5], [3, 5, 7], [10, 10, 10], 30],
  [[2, 5, 1, 6], [4, 7, 8, 9], [30, 25, 100, 20], 100],
  [[4], [9], [7], 7],
  [[1, 2], [10, 3], [5, 5], 5],
  [[1, 2, 3], [4, 5, 6], [3, 3, 3], 3],
  [[1, 4, 2], [4, 6, 6], [5, 6, 10], 11],
  [[1, 999999999], [1000000000, 1000000000], [1, 2], 2],
];
// 10000 unit jobs in reverse order: all of them fit.
const unitStart = [], unitEnd = [], unitProfit = [];
for (let i = 9999; i >= 0; i--) { unitStart.push(i); unitEnd.push(i + 1); unitProfit.push(1); }
jobCases.push([unitStart, unitEnd, unitProfit, 10000]);
// Unit jobs plus length-2 jobs worth 3: one unit job (0..1) then 5000 long jobs at 1, 3, ..., 9999.
const mixStart = unitStart.slice(), mixEnd = unitEnd.slice(), mixProfit = unitProfit.slice();
for (let i = 0; i < 10000; i++) { mixStart.push(i); mixEnd.push(i + 2); mixProfit.push(3); }
jobCases.push([mixStart, mixEnd, mixProfit, 15001]);
for (const [start, end, profit, expected] of jobCases) {
  const got = jobScheduling(start.slice(), end.slice(), profit.slice());
  check(got, expected, `start=${JSON.stringify(start.slice(0, 6))} end=${JSON.stringify(end.slice(0, 6))} (n=${start.length})`);
}
