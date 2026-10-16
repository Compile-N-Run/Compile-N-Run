// Large case: prices fall from 50000 to 1, then rise from 1 to 50000.
const big = [];
for (let i = 0; i < 50000; i++) big.push(50000 - i);
for (let i = 0; i < 50000; i++) big.push(i + 1);
for (const [prices, expected] of [[[9, 2, 6, 1, 4], 4], [[2, 9, 1, 8], 7], [[8, 6, 5, 3], 0], [[5], 0], [[3, 3, 3], 0],
  [[0, 10000], 10000], [[4, 1, 7, 0, 2], 6], [big, 49999]]) {
  check(maxProfit(prices.slice()), expected, `${prices.slice(0, 6)}`);
}
