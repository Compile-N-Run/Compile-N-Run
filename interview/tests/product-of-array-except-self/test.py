from solution import *


def brute(nums):
    out = []
    for i in range(len(nums)):
        p = 1
        for j, x in enumerate(nums):
            if j != i:
                p *= x
        out.append(p)
    return out


big = [2 if i % 100 == 0 else (-1 if i % 7 == 0 else 1) for i in range(1000)]
cases = [([2, 3, 4, 5], [60, 40, 30, 24]), ([3, 0, 4], [0, 12, 0]), ([0, 5, 0], [0, 0, 0]),
         ([-1, 2, -3], [-6, 3, -2]), ([7, 9], [9, 7]), ([0, 0], [0, 0]), ([1, 1, 1, 1], [1, 1, 1, 1]),
         (big, brute(big))]
for nums, expected in cases:
    check(Solution().productExceptSelf(list(nums)), expected, f'{nums[:10]}')
