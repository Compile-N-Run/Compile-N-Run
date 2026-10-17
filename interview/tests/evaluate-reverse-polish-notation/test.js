const rpnCases = [
  [['3', '4', '+', '2', '*'], 14],
  [['10', '3', '/'], 3],
  [['-7', '2', '/'], -3],
  [['7', '-2', '/'], -3],
  [['-7', '-2', '/'], 3],
  [['0', '-5', '/'], 0],
  [['2', '3', '4', '*', '+', '5', '-'], 9],
  [['5'], 5],
  [['-3', '-2', '*'], 6],
  [['6', '3', '-'], 3],
  [['2147483647', '1', '-'], 2147483646],
  [['-2147483648', '1', '/'], -2147483648],
  [['4', '13', '5', '/', '+'], 6],
  [[...new Array(1000).fill('1'), ...new Array(999).fill('+')], 1000], // pushes everything before the first operator
  [['3', '1', '*', ...new Array(10).fill(['2', '*', '1', '-']).flat()], 2049], // x -> 2x - 1, ten times, from 3
];
for (const [tokens, expected] of rpnCases) {
  const label = tokens.length <= 12 ? tokens.join(' ') : `${tokens.slice(0, 6).join(' ')} ... (${tokens.length} tokens)`;
  check(evalRPN(tokens.slice()), expected, label);
}
