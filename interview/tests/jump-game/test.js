const bigOk = new Array(10000).fill(1);
const bigStuck = new Array(10000).fill(1);
bigStuck[5000] = 0;
const jumpCases = [[[2, 0, 1, 0], true], [[1, 1, 0, 2], false], [[3, 0, 0, 0, 5], false], [[0], true], [[5], true],
  [[0, 1], false], [[2, 3, 0, 0, 1], true], [[4, 0, 0, 0, 0], true], [[1, 0, 1, 0], false],
  [bigOk, true], [bigStuck, false], [[10000, ...new Array(9999).fill(0)], true]];
for (const [nums, expected] of jumpCases) {
  check(canJump([...nums]), expected, `size ${nums.length} ${nums.slice(0, 6)}`);
}
