const wildcardCases = [
  ['adceb', '*a*b', true],
  ['acdcb', 'a*c?b', false],
  ['cb', '?a', false],
  ['', '**', true],
  ['abc', '', false],
  ['aa', 'a', false],
  ['aa', '*', true],
  ['', '', true],
  ['', '?', false],
  ['abc', 'abc', true],
  ['abc', 'a?c', true],
  ['a', 'a*', true],
  ['ho', '**ho', true],
  ['mississippi', 'm??*ss*?i*pi', false],
  ['abefcdgiescdfimde', 'ab*cd?i*de', true],
  ['a'.repeat(2000) + 'b', '*a', false],
  ['a'.repeat(1000) + 'b', '*a*b', true],
  ['a'.repeat(2000), '*'.repeat(50) + 'b', false],
  ['a'.repeat(2000), '*a'.repeat(100) + '*', true], // many stars that must each stretch
];
for (const [s, p, expected] of wildcardCases) {
  const label = `"${s.slice(0, 10)}${s.length > 10 ? '...' : ''}" (length ${s.length}) against "${p.slice(0, 12)}${p.length > 12 ? '...' : ''}"`;
  check(isMatch(s, p), expected, label);
}
