from solution import *

# Larger case: 100000 values alternating 10000, -9999; the best run stops at the last 10000.
big = [10000 if i % 2 == 0 else -9999 for i in range(100000)]
cases = [([2, -5, 3, -1, 4, -6, 1], 6), ([-4, -2, -7], -2), ([1, 2, 3], 6), ([7], 7), ([0], 0),
         ([-1, 0, -2], 0), ([5, -10, 5], 5), ([-3, 4, -1, 2, 1, -5], 6), ([-10000], -10000), (big, 59999)]
for nums, expected in cases:
    check(Solution().maxSubArray(list(nums)), expected, f'{nums[:8]}')
