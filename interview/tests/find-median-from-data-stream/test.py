from solution import *

# Each sequence is a list of operations: ('add', num) or ('med', expected median).
A, M = 'add', 'med'
sequences = [
    [(A, 4), (M, 4.0), (A, 10), (M, 7.0), (A, 1), (M, 4.0), (A, 7), (M, 5.5)],
    [(A, -5), (M, -5.0)],
    [(A, 3), (A, 3), (A, 3), (M, 3.0), (A, 3), (M, 3.0)],
    [(A, 5), (M, 5.0), (A, 4), (M, 4.5), (A, 3), (M, 4.0), (A, 2), (M, 3.5), (A, 1), (M, 3.0)],
    [(A, -100000), (A, 100000), (M, 0.0), (A, 0), (M, 0.0)],
    [(A, 2), (M, 2.0), (M, 2.0), (A, 8), (M, 5.0), (M, 5.0)],
]
# Larger case: 3000 pseudo-random numbers, median checked after each against a sorted reference.
big, ref, x = [], [], 11
for _ in range(3000):
    x = x * 48271 % 2147483647
    num = x % 200001 - 100000
    bisect.insort(ref, num)
    t = len(ref)
    big += [(A, num), (M, float(ref[t // 2]) if t % 2 else (ref[t // 2 - 1] + ref[t // 2]) / 2)]
sequences.append(big)

for s, ops in enumerate(sequences):
    finder = MedianFinder()
    for step, (op, value) in enumerate(ops):
        if op == A:
            finder.addNum(value)
        else:
            got = finder.findMedian()
            if abs(got - value) > 1e-6:
                raise AssertionError(f'sequence {s} step {step}: expected {value}, got {got}')
