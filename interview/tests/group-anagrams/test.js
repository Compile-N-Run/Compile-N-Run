const norm = (groups) => groups.map((g) => [...g].sort()).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
const cases = [[['note', 'stone', 'tone', 'onset', 'cat'], [['note', 'tone'], ['stone', 'onset'], ['cat']]],
  [['', 'b', ''], [['', ''], ['b']]], [['loop'], [['loop']]], [[''], [['']]],
  [['ab', 'ab', 'ba', 'abb'], [['ab', 'ab', 'ba'], ['abb']]], [['aab', 'abb', 'bab', 'aba'], [['aab', 'aba'], ['abb', 'bab']]],
  [['x', 'y', 'z'], [['x'], ['y'], ['z']]]];
// Larger case: 1000 rotations of prefixes of "abcdefghij"; words of equal length are anagrams.
const big = [], expectedBig = Array.from({ length: 10 }, () => []);
for (let i = 0; i < 1000; i++) {
  const n = (i % 10) + 1, base = 'abcdefghij'.slice(0, n), r = Math.floor(i / 10) % n;
  const w = base.slice(r) + base.slice(0, r);
  big.push(w);
  expectedBig[n - 1].push(w);
}
cases.push([big, expectedBig]);
for (const [strs, expected] of cases) {
  check(norm(groupAnagrams(strs.slice())), norm(expected), strs.slice(0, 5).join(','));
}
