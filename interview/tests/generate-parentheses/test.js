const valid = (s) => {
  let depth = 0;
  for (const ch of s) {
    depth += ch === '(' ? 1 : -1;
    if (depth < 0) return false;
  }
  return depth === 0;
};
const exact = { 1: ['()'], 2: ['(())', '()()'], 3: ['((()))', '(()())', '(())()', '()(())', '()()()'] };
const catalan = [1, 1, 2, 5, 14, 42, 132, 429, 1430];
for (let n = 1; n <= 8; n++) {
  const got = generateParenthesis(n).slice().sort();
  if (exact[n]) check(got, exact[n], `n=${n}`);
  check(got.length, catalan[n], `n=${n} count`);
  check(new Set(got).size, got.length, `n=${n} duplicates`);
  check(got.every((s) => s.length === 2 * n && valid(s)), true, `n=${n} all valid`);
}
