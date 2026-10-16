{
  // Each op is [0, word, 0] for insert, [1, word, expected] for search or [2, prefix, expected] for startsWith.
  const cases = [
    [[0, 'card', 0], [1, 'card', 1], [1, 'car', 0], [2, 'car', 1], [0, 'car', 0], [1, 'car', 1], [2, 'cat', 0], [2, 'c', 1], [1, 'cards', 0]],
    [[1, 'a', 0], [2, 'a', 0]],
    [[0, 'a', 0], [1, 'a', 1], [2, 'a', 1], [1, 'aa', 0], [2, 'aa', 0], [1, 'b', 0], [2, 'b', 0]],
    [[0, 'zoo', 0], [0, 'zoo', 0], [1, 'zoo', 1], [1, 'zo', 0], [2, 'zoo', 1], [2, 'zoom', 0]],
    [[0, 'apple', 0], [0, 'apply', 0], [0, 'ape', 0], [1, 'app', 0], [2, 'app', 1], [2, 'appl', 1], [1, 'apply', 1], [1, 'ape', 1],
      [1, 'apes', 0], [2, 'apes', 0], [2, 'b', 0], [0, 'app', 0], [1, 'app', 1]],
    [[0, 'abcdefghijklmnopqrstuvwxyz', 0], [1, 'abcdefghijklmnopqrstuvwxyz', 1], [1, 'abcdefghijklmnopqrstuvwxy', 0],
      [2, 'abcdefghijklmnopqrstuvwxy', 1], [0, 'z', 0], [1, 'z', 1], [1, 'zz', 0], [2, 'zy', 0]],
  ];
  const word = (i) => 'w' + String(i).replace(/\d/g, (d) => String.fromCharCode(97 + Number(d))); // 123 -> "wbcd"
  const big = [];
  for (let i = 0; i < 2000; i += 2) big.push([0, word(i), 0]);
  for (let i = 0; i < 2000; i++) big.push([1, word(i), 1 - (i % 2)]);
  for (let i = 0; i < 200; i++) big.push([2, word(i), 1]);
  for (let i = 0; i < 200; i++) big.push([2, word(i) + 'z', 0]);
  cases.push(big);
  cases.forEach((ops, n) => {
    const trie = new Trie();
    ops.forEach(([op, s, expected], step) => {
      if (op === 0) trie.insert(s);
      else check(op === 1 ? trie.search(s) : trie.startsWith(s), expected === 1, `case ${n} step ${step} op ${op}(${s})`);
    });
  });
}
