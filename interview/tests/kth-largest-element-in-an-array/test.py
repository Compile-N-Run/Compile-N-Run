from solution import *

big = [(i * 7919) % 20001 - 10000 for i in range(100000)]
cases = [([7, 2, 9, 4], 2, 7), ([5, 5, 1], 2, 5), ([-1, -8, -3], 3, -8), ([6], 1, 6), ([1, 2, 3, 4, 5], 1, 5),
         ([3, 3, 3, 3], 3, 3), ([10, -10, 0], 2, 0), (big, 500, sorted(big, reverse=True)[499]),
         (big, 100000, min(big))]
for nums, k, expected in cases:
    check(Solution().findKthLargest(list(nums), k), expected, f'{nums[:6]} k={k}')
