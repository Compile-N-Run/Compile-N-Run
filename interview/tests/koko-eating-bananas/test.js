for (const [piles, h, expected] of [[[5, 9, 2], 6, 3], [[10, 10], 2, 10], [[7], 7, 1], [[4, 1, 8], 5, 4], [[2, 2, 2], 3, 2],
  [[1, 1, 1, 1], 10, 1], [[1000000000], 2, 500000000], [new Array(10000).fill(1000000000), 1000000000, 10000],
  [Array.from({ length: 10000 }, (_, i) => i + 1), 10000, 10000]]) {
  check(minEatingSpeed(piles.slice(), h), expected, `${piles.slice(0, 5)} h=${h}`);
}
