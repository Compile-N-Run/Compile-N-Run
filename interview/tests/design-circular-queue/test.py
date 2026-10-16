from solution import *

# Each op is (0, value, expected) for enQueue, (1, 0, expected) for deQueue, (2, 0, expected) for Front,
# (3, 0, expected) for Rear, (4, 0, expected) for isEmpty or (5, 0, expected) for isFull; booleans are 1/0.
big = [(0, v, 1) for v in range(1000)] + [(0, 1000, 0), (5, 0, 1)] + [(1, 0, 1)] * 500 + [(2, 0, 500), (3, 0, 999)]
big += [(0, v, 1) for v in range(1000, 1500)] + [(3, 0, 1499), (5, 0, 1), (0, 9, 0)] + [(1, 0, 1)] * 1000
big += [(1, 0, 0), (4, 0, 1), (2, 0, -1), (3, 0, -1)]
cases = [
    (3, [(0, 4, 1), (0, 9, 1), (0, 2, 1), (0, 7, 0), (5, 0, 1), (1, 0, 1), (2, 0, 9), (0, 7, 1), (3, 0, 7), (4, 0, 0)]),
    (1, [(2, 0, -1), (3, 0, -1), (1, 0, 0), (4, 0, 1), (0, 5, 1), (5, 0, 1), (0, 6, 0), (2, 0, 5), (3, 0, 5), (1, 0, 1), (4, 0, 1),
         (2, 0, -1), (0, 8, 1), (3, 0, 8)]),
    (2, [(0, 1, 1), (0, 2, 1), (1, 0, 1), (0, 3, 1), (2, 0, 2), (3, 0, 3), (5, 0, 1), (1, 0, 1), (1, 0, 1), (1, 0, 0), (4, 0, 1),
         (0, 7, 1), (2, 0, 7), (3, 0, 7)]),
    (4, [(0, 1, 1), (0, 2, 1), (0, 3, 1), (0, 4, 1), (5, 0, 1), (1, 0, 1), (1, 0, 1), (1, 0, 1), (1, 0, 1), (4, 0, 1), (0, 5, 1),
         (0, 6, 1), (2, 0, 5), (3, 0, 6), (1, 0, 1), (2, 0, 6), (3, 0, 6)]),
    (3, [(0, 0, 1), (0, 0, 1), (2, 0, 0), (3, 0, 0), (1, 0, 1), (3, 0, 0), (2, 0, 0), (0, 1000, 1), (3, 0, 1000), (5, 0, 0), (0, 2, 1), (5, 0, 1)]),
    (3, [(0, 1, 1), (0, 2, 1), (0, 3, 1), (1, 0, 1), (0, 4, 1), (2, 0, 2), (3, 0, 4), (1, 0, 1), (0, 5, 1), (2, 0, 3), (3, 0, 5),
         (1, 0, 1), (0, 6, 1), (2, 0, 4), (3, 0, 6), (1, 0, 1), (0, 7, 1), (2, 0, 5), (3, 0, 7)]),
    (1000, big),
]
for n, (k, ops) in enumerate(cases):
    queue = MyCircularQueue(k)
    for step, (op, value, expected) in enumerate(ops):
        label = f'case {n} step {step} op {op}'
        if op == 0:
            check(queue.enQueue(value), expected == 1, label)
        elif op == 1:
            check(queue.deQueue(), expected == 1, label)
        elif op == 2:
            check(queue.Front(), expected, label)
        elif op == 3:
            check(queue.Rear(), expected, label)
        elif op == 4:
            check(queue.isEmpty(), expected == 1, label)
        else:
            check(queue.isFull(), expected == 1, label)
