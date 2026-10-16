{
  for (const [nums, target, expected] of [[[15, 18, 22, 3, 7, 11], 7, 4], [[15, 18, 22, 3, 7, 11], 20, -1], [[30, 40, 50, 10, 20], 40, 1],
    [[9], 9, 0], [[9], 4, -1], [[2, 1], 1, 1], [[1, 2, 3, 4, 5], 5, 4], [[5, 1, 3], 5, 0], [[5, 1, 3], 3, 2], [[-8, -5, -10], -10, 2]]) {
    check(search(nums.slice(), target), expected, `${nums} ${target}`);
  }
  // Exhaustive: every rotation of small arrays of even numbers, every target (odd ones are missing).
  for (const n of [1, 2, 3, 7, 50]) {
    for (let r = 0; r < n; r++) {
      const nums = Array.from({ length: n }, (_, j) => 2 * ((j + r) % n));
      for (let t = -1; t <= 2 * n; t++) {
        const expected = t % 2 === 0 && t >= 0 && t < 2 * n ? (((t / 2 - r) % n) + n) % n : -1;
        check(search(nums, t), expected, `n=${n} r=${r} t=${t}`);
      }
    }
  }
  const big = [];
  for (let i = 0; i < 5000; i++) big.push((i + 1234) % 5000); // 5000 values, rotated
  check(search(big, 0), 3766, 'big 0');
  check(search(big, 4999), 3765, 'big 4999');
  check(search(big, 5000), -1, 'big 5000');
}
