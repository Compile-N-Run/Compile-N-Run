from solution import *

cases = [([2, 7, 2], 2), ([5], 5), ([-1, -1, 4, 4, -1], -1), ([3, 3, 8, 8, 3, 8, 8], 8),
         ([10**9, -10**9, 10**9], 10**9), ([0, 0, 0, 0], 0), ([1, 2, 1, 3, 1, 4, 1], 1)]
# Larger case: 25001 copies of -7 interleaved with 24999 distinct other values.
big = []
for i in range(25000):
    big += [-7, i]
big[-1] = -7  # replace the last distinct value so -7 appears 25001 times
big.append(99)
cases.append((big, -7))
for nums, expected in cases:
    check(Solution().majorityElement(list(nums)), expected, f'{nums[:8]}')
