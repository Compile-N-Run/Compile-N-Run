const aWords = ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaaaaaa'];
const breakCases = [['sunflower', ['sun', 'flower', 'flow'], true], ['hotdogs', ['hot', 'dog', 'hotdog'], false],
  ['abab', ['ab'], true], ['applepie', ['apple', 'app', 'lepie'], true], ['a', ['b'], false], ['a', ['a'], true],
  ['catcat', ['cats', 'at'], false], ['ab', ['abc'], false],
  ['a'.repeat(299) + 'b', aWords, false], ['a'.repeat(300), aWords, true], ['ab'.repeat(150), ['a', 'b', 'ba'], true]];
for (const [s, words, expected] of breakCases) {
  check(wordBreak(s, [...words]), expected, `${s.slice(0, 20)} ${words}`);
}
