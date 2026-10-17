const breakCases = [
  ['icecreamcone', ['ice', 'cream', 'cone', 'icecream'], ['ice cream cone', 'icecream cone']],
  ['sunflowerpot', ['sun', 'flower', 'pot', 'flow', 'erpot'], ['sun flow erpot', 'sun flower pot']],
  ['hotdogs', ['hot', 'dog', 'hotdog'], []],
  ['a', ['a'], ['a']],
  ['a', ['b'], []],
  ['aaa', ['a', 'aa'], ['a a a', 'a aa', 'aa a']],
  ['abab', ['ab', 'abab', 'a', 'b'], ['a b a b', 'a b ab', 'ab a b', 'ab ab', 'abab']],
  ['a'.repeat(25) + 'b', ['a', 'aa', 'aaa'], []],
];
for (const [s, words, expected] of breakCases) {
  check(wordBreak(s, [...words]).slice().sort(), expected, `${s.slice(0, 20)} ${words}`);
}

// Larger case: 'a' * 12 with pieces of 1-3 letters has 927 sentences (a tribonacci number).
const big = 'a'.repeat(12), bigWords = ['a', 'aa', 'aaa'];
const got = wordBreak(big, [...bigWords]);
check(got.length, 927, `count ${big} ${bigWords}`);
check(new Set(got).size, 927, `distinct ${big} ${bigWords}`);
check(got.every((sentence) => sentence.replace(/ /g, '') === big && sentence.split(' ').every((w) => bigWords.includes(w))),
  true, `each sentence spells s ${big} ${bigWords}`);
