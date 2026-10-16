from solution import *

# Each op is (0, key, value) for put or (1, key, expected) for get.
cases = [
    (2, [(0, 1, 10), (0, 2, 20), (1, 1, 10), (0, 3, 30), (1, 2, -1), (1, 3, 30), (0, 4, 40), (1, 1, -1), (1, 3, 30),
         (1, 4, 40)]),
    (1, [(0, 5, 50), (1, 5, 50), (0, 6, 60), (1, 5, -1), (1, 6, 60)]),
    (2, [(0, 1, 1), (0, 2, 2), (0, 1, 100), (0, 3, 3), (1, 1, 100), (1, 2, -1), (1, 3, 3)]),
    (3, [(1, 7, -1), (0, 7, 0), (1, 7, 0), (1, 8, -1)]),
    (2, [(0, 1, 1), (1, 1, 1), (1, 1, 1), (1, 1, 1), (0, 2, 2), (0, 3, 3), (1, 2, -1), (1, 3, 3), (0, 4, 4), (1, 3, -1),
         (1, 1, 1), (1, 4, 4)]),
    (3, [(0, 1, 1), (0, 2, 2), (0, 3, 3), (0, 4, 4), (1, 1, -1), (1, 2, 2), (0, 5, 5), (1, 3, -1), (1, 4, 4), (1, 5, 5)]),
    (2, [(0, 3, 1), (0, 2, 1), (0, 2, 2), (0, 4, 4), (1, 2, 2), (1, 3, -1), (1, 4, 4)]),
    # Keys 0..49 are read once, so they outlive every key that is only ever inserted.
    (100, [(0, i, 2 * i) for i in range(100)] + [(1, i, 2 * i) for i in range(50)]
     + [(0, i, 2 * i) for i in range(100, 1000)]
     + [(1, i, 2 * i if i < 50 or i >= 950 else -1) for i in range(1000)]),
]
for n, (capacity, ops) in enumerate(cases):
    cache = LFUCache(capacity)
    for step, (op, a, b) in enumerate(ops):
        if op == 0:
            cache.put(a, b)
        else:
            check(cache.get(a), b, f'case {n} step {step} get({a})')
