const oneTo50000 = Array.from({ length: 50000 }, (_, i) => i + 1);
const evens50000 = Array.from({ length: 50000 }, (_, i) => 2 * (i + 1));
const lcpCases = [
  [[1, 10, 100], [1000], 3],
  [[123, 456], [1234, 45], 3],
  [[12], [123, 124, 125], 2],
  [[1, 2, 3], [4, 4, 4], 0],
  [[100000000], [100000000], 9],
  [[5], [5], 1],
  [[7, 77, 777], [7777], 3],
  [[100], [1000, 10], 3],
  [[13, 27], [2, 1], 1],
  [[987654321], [98765, 9876543], 7],
  [[21, 210], [2100, 20], 3],
  [oneTo50000, [49999], 5], // 49999 itself is in arr1
  [oneTo50000, [100000000], 5], // prefix 10000 is in arr1 but 100000 is not
  [evens50000, [99999999], 4], // 9999 is a prefix of 99990, but no even number below 100001 starts with 99999
];
for (const [arr1, arr2, expected] of lcpCases) {
  check(longestCommonPrefix(arr1.slice(), arr2.slice()), expected,
    `arr1=${JSON.stringify(arr1.slice(0, 5))} (length ${arr1.length}) arr2=${JSON.stringify(arr2.slice(0, 5))}`);
}
