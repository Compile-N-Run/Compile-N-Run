{
  const big = Array.from({ length: 10000 }, (_, i) => i % 10); // 1000 climbs from 0 to 9
  for (const [prices, expected] of [[[3, 1, 4, 2, 6], 7], [[2, 3, 5, 8], 6], [[9, 7, 4, 1], 0], [[5], 0], [[4, 4, 4], 0],
    [[0, 10000], 10000], [[7, 1, 5, 3, 6, 4], 7], [[1, 5, 5, 2, 8], 10], [big, 9000]]) {
    check(maxProfit(prices.slice()), expected, `${prices.slice(0, 10)}`);
  }
}
