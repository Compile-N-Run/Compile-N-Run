for (const [s, expected] of [['())((())', 4], ['(()()', 4], ['()(())', 6], [')(', 0], ['', 0], ['((((', 0], ['()(()', 2],
  [')()())()()(', 4], ['()', 2],
  ['(' + '()'.repeat(5000) + ')' + ')', 10002], ['()'.repeat(3000) + '(' + '()'.repeat(2000), 6000]]) {
  check(longestValidParentheses(s), expected, JSON.stringify(s.slice(0, 20)));
}
