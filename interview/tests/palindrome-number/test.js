for (const [x, expected] of [[1331, true], [12321, true], [-44, false], [50, false], [0, true], [7, true], [10, false],
  [1000021, false], [1000000001, true], [2147447412, true], [2147483647, false], [-2147483648, false]]) {
  check(isPalindrome(x), expected, String(x));
}
