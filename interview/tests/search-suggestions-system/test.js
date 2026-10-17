const suggestItems = Array.from({ length: 1000 }, (_, i) => `item${String(i).padStart(4, '0')}`).reverse();
const firstThree = ['item0000', 'item0001', 'item0002'];
const suggestCases = [
  [['banana', 'band', 'bandana', 'bandit', 'bank'], 'band',
    [['banana', 'band', 'bandana'], ['banana', 'band', 'bandana'], ['banana', 'band', 'bandana'], ['band', 'bandana', 'bandit']]],
  [['apple', 'apply', 'ape'], 'apex', [['ape', 'apple', 'apply'], ['ape', 'apple', 'apply'], ['ape'], []]],
  [['cat'], 'dog', [[], [], []]],
  [['code', 'coder', 'codes', 'coding'], 'code',
    [['code', 'coder', 'codes'], ['code', 'coder', 'codes'], ['code', 'coder', 'codes'], ['code', 'coder', 'codes']]],
  [['a', 'aa', 'aaa', 'aaaa'], 'aaaa', [['a', 'aa', 'aaa'], ['aa', 'aaa', 'aaaa'], ['aaa', 'aaaa'], ['aaaa']]],
  [['zebra', 'zoo'], 'az', [[], []]],
  [['sun', 'sea', 'sand', 'sugar'], 's', [['sand', 'sea', 'sugar']]],
  [['tea', 'ten', 'team', 'teach', 'tear', 'teal'], 'tean',
    [['tea', 'teach', 'teal'], ['tea', 'teach', 'teal'], ['tea', 'teach', 'teal'], []]],
  [suggestItems, 'item0999',
    [firstThree, firstThree, firstThree, firstThree, firstThree,
      ['item0900', 'item0901', 'item0902'], ['item0990', 'item0991', 'item0992'], ['item0999']]],
];
for (const [products, word, expected] of suggestCases) {
  const got = suggestedProducts(products.slice(), word);
  check(got, expected, `${JSON.stringify(products.slice(0, 4))}${products.length > 4 ? '...' : ''} "${word}"`);
}
