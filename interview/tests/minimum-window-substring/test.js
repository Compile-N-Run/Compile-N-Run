const bigArr = new Array(100000).fill('x');
bigArr[10] = 'a'; bigArr[30000] = 'a'; bigArr[30005] = 'c'; bigArr[30010] = 'b';
const bigStr = bigArr.join('');
for (const [s, t, expected] of [['thequickfox', 'qf', 'quickf'], ['abacab', 'aab', 'aba'], ['abc', 'aa', ''], ['a', 'ab', ''],
  ['a', 'a', 'a'], ['Aa', 'a', 'a'], ['Aa', 'A', 'A'], ['abc', 'd', ''], ['MXNOYXMN', 'MN', 'MN'],
  ['aaflslflsldkalskaaa', 'aaa', 'aaa'], [bigStr, 'abc', bigStr.slice(30000, 30011)]]) {
  check(minWindow(s, t), expected, `${s.slice(0, 20)} ${t}`);
}
