from solution import *

big = [v for v in range(-500, 500) for _ in range(v % 3 + 1)]
cases = [([2, 2, 5, 7, 7, 7], [2, 5, 7]), ([-4, -4, -4], [-4]), ([1, 3, 8], [1, 3, 8]), ([6], [6]),
         ([0, 0, 1, 1, 1, 2, 2, 3, 3, 4], [0, 1, 2, 3, 4]), ([-100, 100], [-100, 100]), (big, list(range(-500, 500)))]
for nums, expected in cases:
    arr = list(nums)
    k = Solution().removeDuplicates(arr)
    check(k, len(expected), f'k for {nums[:10]}')
    check(arr[:k], expected, f'prefix for {nums[:10]}')
