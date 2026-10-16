const lcKeys = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
// Independent iterative reference: extend every prefix by each letter of the next digit.
const lcExpand = (digits) => {
  if (!digits) return [];
  let out = [''];
  for (const d of digits) out = out.flatMap((s) => lcKeys[Number(d)].split('').map((ch) => s + ch));
  return out.sort();
};
check(lcExpand('29').length, 12, 'count 29');
check(lcExpand('7979').length, 256, 'count 7979');
for (const [digits, expected] of [['56', ['jm', 'jn', 'jo', 'km', 'kn', 'ko', 'lm', 'ln', 'lo']], ['7', ['p', 'q', 'r', 's']],
  ['', []], ['2', ['a', 'b', 'c']], ['29', lcExpand('29')], ['99', lcExpand('99')], ['234', lcExpand('234')],
  ['7979', lcExpand('7979')]]) {
  check(letterCombinations(digits).slice().sort(), expected, JSON.stringify(digits));
}
