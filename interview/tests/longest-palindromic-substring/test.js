// Larger case: 990 letters cycling through the alphabet (no palindrome longer than 1)
// with a 10-character palindrome inserted in the middle.
let alpha = '';
for (let i = 0; i < 990; i++) alpha += String.fromCharCode(97 + (i % 26));
const big = alpha.slice(0, 500) + '1234554321' + alpha.slice(500);
for (const [s, length] of [['xracecarz', 7], ['abbc', 2], ['pqr', 1], ['aaaa', 4], ['a', 1], ['Aa', 1],
  ['abacdfgdcaba', 3], ['ab12321ba', 9], [big, 10]]) {
  const got = longestPalindrome(s);
  check([got.length, got === [...got].reverse().join(''), s.includes(got)], [length, true, true], s.slice(0, 20));
}
