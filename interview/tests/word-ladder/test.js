const big = [];
for (const a of 'abcdefghij') for (const b of 'abcdefghij') for (const c of 'abcdefghij') big.push(a + b + c);
for (const [begin, end, words, expected] of [
  ['cat', 'dog', ['cot', 'cog', 'dog', 'bat'], 4],
  ['cold', 'warm', ['cord', 'card', 'ward', 'warm', 'worm'], 5],
  ['cat', 'dog', ['cot', 'cog', 'bat'], 0],
  ['a', 'c', ['a', 'b', 'c'], 2],
  ['hot', 'dog', ['hot', 'dog'], 0],
  ['lost', 'cost', ['most', 'fist', 'lost', 'cost', 'fish'], 2],
  ['abc', 'xyz', ['abd', 'xyz'], 0],
  ['aaa', 'jjj', big, 4]]) {
  check(ladderLength(begin, end, words.slice()), expected, `${begin} -> ${end}`);
}
