for (const [text, expected] of [['xxxyzz', 'x3yz2'], ['q', 'q'], ['m'.repeat(12), 'm12'], ['abba', 'ab2a'], ['##@@@1111', '#2@314'],
  ['z'.repeat(10), 'z10'], ['ab', 'ab'], ['11122', '1322'], ['a'.repeat(1000) + 'b' + 'c'.repeat(100), 'a1000bc100']]) {
  const chars = text.split('');
  const n = compress(chars);
  check(n, expected.length, `${text.slice(0, 20)} length`);
  check(chars.slice(0, n).join(''), expected, text.slice(0, 20));
}
