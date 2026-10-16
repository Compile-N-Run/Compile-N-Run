const big = []; for (let v = -500; v < 500; v++) for (let c = 0; c <= ((v % 3) + 3) % 3; c++) big.push(v);
const bigExpected = []; for (let v = -500; v < 500; v++) bigExpected.push(v);
for (const [nums, expected] of [[[2, 2, 5, 7, 7, 7], [2, 5, 7]], [[-4, -4, -4], [-4]], [[1, 3, 8], [1, 3, 8]], [[6], [6]],
  [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4], [0, 1, 2, 3, 4]], [[-100, 100], [-100, 100]], [big, bigExpected]]) {
  const arr = nums.slice();
  const k = removeDuplicates(arr);
  check(k, expected.length, `k for ${nums.slice(0, 10)}`);
  check(arr.slice(0, k), expected, `prefix for ${nums.slice(0, 10)}`);
}
