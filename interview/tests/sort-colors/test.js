const colorCases = [[2, 1, 0, 2, 0, 1], [1, 2, 1], [2, 2, 0], [1], [2, 0], [1, 0], [0, 0, 0], [2, 1, 0]];
colorCases.push(Array.from({ length: 1000 }, (_, i) => (i * 7 + Math.floor(i / 3)) % 3));
for (const nums of colorCases) {
  const got = nums.slice();
  sortColors(got);
  check(got, nums.slice().sort((a, b) => a - b), `${nums.slice(0, 10)}`);
}
