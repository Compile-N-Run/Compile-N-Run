{
  const cases = [['  hello   big world ', 'world big hello'], ['a', 'a'], ['code  2 run', 'run 2 code'], ['   spaces  ', 'spaces'],
    ['x y z', 'z y x'], ['Ab12 cD', 'cD Ab12'], ['same same', 'same same']];
  // Larger case: 2000 words with 1 to 3 spaces between them and spaces at both ends.
  const words = Array.from({ length: 2000 }, (_, i) => `w${i}`);
  const big = '  ' + words.map((w, i) => w + ' '.repeat(1 + (i % 3))).join('');
  cases.push([big, words.slice().reverse().join(' ')]);
  for (const [s, expected] of cases) check(reverseWords(s), expected, JSON.stringify(s.slice(0, 30)));
}
