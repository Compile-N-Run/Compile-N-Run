{
  const pad = (i) => 'w' + String(i).padStart(3, '0');
  const big = [];
  for (let i = 199; i >= 0; i--) for (let r = 0; r <= i % 10; r++) big.push(pad(i)); // word i appears i % 10 + 1 times
  const top25 = [];
  for (let i = 9; i < 200; i += 10) top25.push(pad(i));
  top25.push('w008', 'w018', 'w028', 'w038', 'w048');
  const all = [];
  for (let f = 10; f >= 1; f--) for (let i = f - 1; i < 200; i += 10) all.push(pad(i));
  const cases = [
    [['pear', 'apple', 'pear', 'fig', 'apple', 'pear'], 2, ['pear', 'apple']],
    [['b', 'a', 'b', 'a'], 2, ['a', 'b']],
    [['dog', 'cat', 'dog', 'cat', 'bird', 'bird', 'ant'], 3, ['bird', 'cat', 'dog']],
    [['solo'], 1, ['solo']],
    [['z', 'y', 'x'], 1, ['x']],
    [['aa', 'a', 'aaa', 'a', 'aa'], 3, ['a', 'aa', 'aaa']],
    [['q', 'w', 'e', 'w'], 3, ['w', 'e', 'q']],
    [['x', 'y', 'y', 'x', 'z'], 1, ['x']],
    [big, 25, top25],
    [big, 200, all],
  ];
  for (const [words, k, expected] of cases) {
    check(topKFrequent(words.slice(), k), expected, `${words.slice(0, 6)} k=${k}`);
  }
}
