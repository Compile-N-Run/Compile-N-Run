from solution import *


def brute(nums, k):
    return [max(nums[i:i + k]) for i in range(len(nums) - k + 1)]


def generate(n, seed=7):
    out, x = [], seed
    for _ in range(n):
        x = x * 48271 % 2147483647
        out.append(x % 2001 - 1000)
    return out


big = generate(5000)
cases = [([2, 5, 1, 3, 4, 0], 3, [5, 5, 4, 4]), ([6, 4, 2], 1, [6, 4, 2]), ([-3, -1, -7, -2], 4, [-1]),
         ([1, 3, 3, 2], 2, [3, 3, 3]), ([1, 3, -1, -3, 5, 3, 6, 7], 3, [3, 3, 5, 5, 6, 7]),
         ([9, 8, 7, 6, 5], 2, [9, 8, 7, 6]), ([4], 1, [4]), ([7, 7, 7, 7], 3, [7, 7]),
         (big, 137, brute(big, 137))]
for nums, k, expected in cases:
    check(Solution().maxSlidingWindow(list(nums), k), expected, f'{nums[:10]} k={k}')
