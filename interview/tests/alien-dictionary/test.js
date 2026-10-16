// True when `order` lists every letter of `words` exactly once and respects every adjacent-pair constraint.
function validOrder(words, order) {
  const letters = [...new Set(words.join(''))].sort().join('');
  if ([...order].sort().join('') !== letters) return false;
  const pos = new Map([...order].map((c, i) => [c, i]));
  for (let i = 0; i + 1 < words.length; i++) {
    const w1 = words[i], w2 = words[i + 1];
    let k = 0;
    while (k < w1.length && k < w2.length && w1[k] === w2[k]) k++;
    if (k < w1.length && k < w2.length) {
      if (pos.get(w1[k]) >= pos.get(w2[k])) return false;
    } else if (w1.length > w2.length) {
      return false;
    }
  }
  return true;
}

// [words, solvable]: any valid order is accepted; an unsolvable list must give ''.
const perm = 'qwertyuiopasdfghjklzxcvbnm';
const pairs = [];
for (const a of perm) for (const b of perm) pairs.push(a + b);
const alienCases = [
  [['ba', 'bc', 'ac', 'cab'], true],
  [['zy', 'zx'], true],
  [['ab', 'abc'], true],
  [['abc', 'ab'], false],
  [['q', 'w', 'q'], false],
  [['wrt', 'wrf', 'er', 'ett', 'rftt'], true],
  [['z', 'z'], true],
  [['a'], true],
  [['abcxyz'], true],
  [['ac', 'ab', 'zc', 'zb'], true],
  [['ab', 'ba', 'ab'], false],
  [['abc', 'abd', 'ab'], false],
  [['z', 'y', 'x', 'w'], true],
  [pairs, true], // 676 words that pin down every letter
];
for (const [words, solvable] of alienCases) {
  const got = alienOrder(words.slice());
  if (solvable) check(validOrder(words, got), true, `${JSON.stringify(words.slice(0, 5))}: got ${JSON.stringify(got)}`);
  else check(got, '', JSON.stringify(words.slice(0, 5)));
}
check(alienOrder(pairs.slice()), perm, 'full alphabet is unique');
