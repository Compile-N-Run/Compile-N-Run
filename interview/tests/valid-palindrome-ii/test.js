const half = 'ab'.repeat(2500);
const mirror = half + half.split('').reverse().join(''); // a 10,000-character palindrome
const palindromeCases = [
  ['abca', true],
  ['acba', true],
  ['abc', false],
  ['racecar', true],
  ['abcdba', true],
  ['a', true],
  ['ab', true],
  ['aba', true],
  ['abba', true],
  ['abcca', true],
  ['accba', true],
  ['abcdedcbaq', true],
  ['xabcdedcby', false],
  ['deeee', true],
  ['eedcfee', false],
  ['compilexnrunnurnelipmoc', true],
  ['compilexnrunnurnelipmyoc', false],
  [mirror, true],
  [half + 'z' + half.split('').reverse().join(''), true],
  ['z' + mirror, true],
  [mirror + 'z', true],
  ['ab'.repeat(5000), true],
  [mirror.slice(0, 2500) + 'zq' + mirror.slice(2500), false],
  [mirror.slice(0, 100) + 'z' + mirror.slice(100, 200) + 'q' + mirror.slice(200), false],
];
for (const [s, expected] of palindromeCases) {
  const label = s.length <= 40 ? s : `${s.slice(0, 12)}...${s.slice(-12)} (${s.length} chars)`;
  check(validPalindrome(s), expected, label);
}
