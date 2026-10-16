from solution import *

# Each op is ('set', key, value, timestamp) or ('get', key, timestamp, expected).
cases = [
    [('set', 'color', 'red', 3), ('set', 'color', 'blue', 8), ('get', 'color', 2, ''), ('get', 'color', 3, 'red'),
     ('get', 'color', 5, 'red'), ('get', 'color', 8, 'blue'), ('get', 'color', 100, 'blue'), ('get', 'size', 5, '')],
    [('get', 'x', 1, '')],
    [('set', 'a', 'one', 1), ('get', 'a', 1, 'one'), ('get', 'a', 10000000, 'one')],
    [('set', 'a', 'p', 2), ('set', 'b', 'q', 4), ('set', 'a', 'r', 6), ('get', 'b', 3, ''), ('get', 'a', 4, 'p'),
     ('get', 'b', 5, 'q'), ('get', 'a', 6, 'r'), ('get', 'c', 6, '')],
    [('set', 'k', 'same', 1), ('set', 'k', 'same', 2), ('set', 'k', 'diff', 3), ('get', 'k', 2, 'same'),
     ('get', 'k', 3, 'diff')],
    [('set', 'love', 'high', 10), ('set', 'love', 'low', 20), ('get', 'love', 5, ''), ('get', 'love', 10, 'high'),
     ('get', 'love', 15, 'high'), ('get', 'love', 20, 'low'), ('get', 'love', 25, 'low')],
    [('set', 'k', f'v{i}', 2 * i) for i in range(1, 1001)]
    + [('get', 'k', 2 * i + 1, f'v{i}') for i in range(1, 1001)] + [('get', 'k', 1, '')],
]
for n, ops in enumerate(cases):
    tm = TimeMap()
    for step, op in enumerate(ops):
        if op[0] == 'set':
            tm.set(op[1], op[2], op[3])
        else:
            check(tm.get(op[1], op[2]), op[3], f'case {n} step {step} get({op[1]!r}, {op[2]})')
