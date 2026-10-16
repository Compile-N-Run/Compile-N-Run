const big = new Array(999).fill(50).concat([60]);
const bigExpected = Array.from({ length: 1000 }, (_, i) => (i < 999 ? 999 - i : 0));
for (const [temps, expected] of [[[70, 68, 69, 72, 71], [3, 1, 1, 0, 0]], [[50, 50, 50], [0, 0, 0]], [[30, 40, 50], [1, 1, 0]],
  [[80, 60, 70, 90], [3, 1, 1, 0]], [[55], [0]], [[100, 90, 80, 95, 30], [0, 2, 1, 0, 0]], [big, bigExpected]]) {
  check(dailyTemperatures(temps.slice()), expected, `${temps.slice(0, 8)}`);
}
