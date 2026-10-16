from solution import *


def brute(nums, k):
    total = 0
    for i in range(len(nums)):
        s = 0
        for j in range(i, len(nums)):
            s += nums[j]
            total += s == k
    return total


big, x = [], 3
for _ in range(2000):
    x = x * 48271 % 2147483647
    big.append(x % 21 - 10)
cases = [([1, 2, 3], 3, 2), ([1, 1, 1, 1], 2, 3), ([2, -2, 2, -2], 0, 4), ([5], 5, 1), ([5], 4, 0),
         ([-1, -1, 1], 0, 1), ([0, 0, 0], 0, 6), ([3, 4, 7, 2, -3, 1, 4, 2], 7, 4), ([1, -1, 0], 0, 3),
         ([-3, -2], -5, 1), ([0] * 2000, 0, 2001000), (big, 5, brute(big, 5))]
for nums, k, expected in cases:
    check(Solution().subarraySum(list(nums), k), expected, f'{nums[:10]} k={k}')
