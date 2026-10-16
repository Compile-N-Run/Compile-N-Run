const shipBig = Array.from({ length: 50000 }, (_, i) => (i % 500) + 1);
const shipCases = [
  [[3, 2, 2, 4, 1, 4], 3, 6],
  [[7, 3, 5], 1, 15],
  [[7, 3, 5], 3, 7],
  [[5], 1, 5],
  [[1, 1, 1, 1], 2, 2],
  [[1, 1, 1, 1], 4, 1],
  [[1, 1, 1, 1], 3, 2],
  [[10, 1, 1, 1, 1, 10], 2, 12],
  [[6, 2, 9, 3, 8, 1], 4, 9],
  [[500, 500, 500], 50, 500],
  [shipBig, 100, 125250],
  [shipBig, 1, 12525000],
  [shipBig, 50000, 500],
];
for (const [weights, days, expected] of shipCases) {
  check(shipWithinDays(weights.slice(), days), expected, `${weights.slice(0, 6)} days=${days}`);
}
