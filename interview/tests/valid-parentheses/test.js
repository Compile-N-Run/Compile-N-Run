for (const [s, expected] of [["([]{})", true], ["([)]", false], ["((", false], ["}", false], ["()[]{}", true], [")(", false],
  ["{[()()]}", true], ["[", false], ["(]", false], ["{[(".repeat(3000) + ")]}".repeat(3000), true],
  ["(".repeat(5000) + ")".repeat(4999), false]]) {
  check(isValid(s), expected, s.slice(0, 20));
}
