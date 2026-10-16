let bigS = '';
for (let i = 0; i < 50000; i++) bigS += String.fromCharCode(97 + (i % 26));
const bigT = bigS.split('').reverse().join('');
for (const [s, t, expected] of [['listen', 'silent', true], ['bell', 'bel', false], ['aab', 'abb', false], ['x', 'x', true],
  ['a', 'b', false], ['anagram', 'nagaram', true], ['abc', 'abcc', false], ['zzzz', 'zzzz', true],
  [bigS, bigT, true], [bigS, bigT.slice(0, -1) + 'q', false]]) {
  check(isAnagram(s, t), expected, `${s.slice(0, 20)} ${t.slice(0, 20)}`);
}
