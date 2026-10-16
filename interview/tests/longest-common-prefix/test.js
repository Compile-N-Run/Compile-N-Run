// Larger case: 200 words of 200 characters that share their first 150 characters.
const big = Array.from({ length: 200 }, (_, i) => 'k'.repeat(150) + String.fromCharCode(97 + (i % 26)).repeat(50));
for (const [strs, expected] of [[['interview', 'internet', 'interval'], 'inter'], [['apple', 'banana'], ''],
  [['code', 'coder', 'co'], 'co'], [['solo'], 'solo'], [[''], ''], [['abc', ''], ''], [['same', 'same', 'same'], 'same'],
  [['prefix', 'pre', 'prelude', 'prey'], 'pre'], [big, 'k'.repeat(150)]]) {
  check(longestCommonPrefix(strs.slice()), expected, strs.slice(0, 4).join(','));
}
