from solution import *


def reference(a, b):
    merged = sorted(a + b)
    t = len(merged)
    return float(merged[t // 2]) if t % 2 else (merged[t // 2 - 1] + merged[t // 2]) / 2


big1 = sorted((i * 7919) % 2001 - 1000 for i in range(999))
big2 = sorted((i * 104729) % 1999 - 1000 for i in range(1000))
cases = [([1, 4, 9], [2, 3], 3.0), ([5, 8], [1, 2, 10, 12], 6.5), ([], [7], 7.0), ([2, 2], [2, 2], 2.0),
         ([3], [], 3.0), ([1, 2], [3, 4], 2.5), ([10, 20, 30], [1, 2, 3, 4, 5, 6], 5.0),
         ([-5, -3], [-4], -4.0), ([1000000], [-1000000], 0.0), (big1, big2, reference(big1, big2))]
for a, b, expected in cases:
    got = Solution().findMedianSortedArrays(list(a), list(b))
    if abs(got - expected) > 1e-6:
        raise AssertionError(f'{a[:5]} {b[:5]}: expected {expected}, got {got}')
