const isPeak = (nums, i) => Number.isInteger(i) && i >= 0 && i < nums.length &&
  (i === 0 || nums[i] > nums[i - 1]) && (i === nums.length - 1 || nums[i] > nums[i + 1]);
const MIN = -(2 ** 31);
const MAX = 2 ** 31 - 1;
const peakCases = [[2, 5, 3], [1, 3, 2, 6, 4], [9, 7, 4], [1, 2, 3, 4], [7], [MIN], [MIN, MIN + 1], [3, 1],
  [MAX, MIN, MAX], Array.from({ length: 10001 }, (_, i) => i % 2),
  Array.from({ length: 10000 }, (_, i) => (i < 7000 ? i : 14000 - i))];
for (const nums of peakCases) {
  const got = findPeakElement([...nums]);
  check(isPeak(nums, got), true, `size ${nums.length} ${nums.slice(0, 6)} returned ${got}`);
}
