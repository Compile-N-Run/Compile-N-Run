from solution import *

# Each op is (0, value) for push, (1, 0) for pop, (2, expected) for top or (3, expected) for getMin.
big = [(0, v) for v in range(1000, 0, -1)]
for v in range(1, 1000):
    big += [(3, v), (2, v), (1, 0)]
big += [(3, 1000)] + [(0, v) for v in range(2000, 3000)] + [(3, 1000), (2, 2999)]
cases = [
    [(0, 4), (0, 2), (0, 7), (3, 2), (2, 7), (1, 0), (1, 0), (3, 4), (2, 4)],
    [(0, 3), (0, 3), (1, 0), (3, 3), (2, 3)],
    [(0, -1), (0, 5), (3, -1), (2, 5)],
    [(0, 9), (3, 9), (2, 9)],
    [(0, -2147483648), (0, 2147483647), (3, -2147483648), (2, 2147483647), (1, 0), (2, -2147483648)],
    [(0, 1), (0, 2), (0, 0), (3, 0), (1, 0), (3, 1), (0, -3), (3, -3), (1, 0), (1, 0), (3, 1), (2, 1)],
    [(0, 5), (1, 0), (0, 8), (3, 8), (0, 6), (3, 6), (2, 6)],
    big,
]
for n, ops in enumerate(cases):
    stack = MinStack()
    for step, (op, x) in enumerate(ops):
        if op == 0:
            stack.push(x)
        elif op == 1:
            stack.pop()
        elif op == 2:
            check(stack.top(), x, f'case {n} step {step} top')
        else:
            check(stack.getMin(), x, f'case {n} step {step} getMin')
