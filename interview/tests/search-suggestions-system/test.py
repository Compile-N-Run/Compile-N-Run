from solution import *

items = [f'item{i:04d}' for i in range(1000)]
first_three = ['item0000', 'item0001', 'item0002']
cases = [
    (['banana', 'band', 'bandana', 'bandit', 'bank'], 'band',
     [['banana', 'band', 'bandana'], ['banana', 'band', 'bandana'], ['banana', 'band', 'bandana'], ['band', 'bandana', 'bandit']]),
    (['apple', 'apply', 'ape'], 'apex', [['ape', 'apple', 'apply'], ['ape', 'apple', 'apply'], ['ape'], []]),
    (['cat'], 'dog', [[], [], []]),
    (['code', 'coder', 'codes', 'coding'], 'code',
     [['code', 'coder', 'codes'], ['code', 'coder', 'codes'], ['code', 'coder', 'codes'], ['code', 'coder', 'codes']]),
    (['a', 'aa', 'aaa', 'aaaa'], 'aaaa', [['a', 'aa', 'aaa'], ['aa', 'aaa', 'aaaa'], ['aaa', 'aaaa'], ['aaaa']]),
    (['zebra', 'zoo'], 'az', [[], []]),
    (['sun', 'sea', 'sand', 'sugar'], 's', [['sand', 'sea', 'sugar']]),
    (['tea', 'ten', 'team', 'teach', 'tear', 'teal'], 'tean',
     [['tea', 'teach', 'teal'], ['tea', 'teach', 'teal'], ['tea', 'teach', 'teal'], []]),
    (list(reversed(items)), 'item0999',
     [first_three, first_three, first_three, first_three, first_three,
      ['item0900', 'item0901', 'item0902'], ['item0990', 'item0991', 'item0992'], ['item0999']]),
]
for products, word, expected in cases:
    got = Solution().suggestedProducts(list(products), word)
    check(got, expected, f'{products[:4]}{"..." if len(products) > 4 else ""} "{word}"')
