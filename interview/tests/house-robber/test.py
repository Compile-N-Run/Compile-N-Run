from solution import *

big = [(i * 37) % 401 for i in range(100)]
cases = [([3, 10, 3, 1, 8], 18), ([6, 1, 1, 6], 12), ([4, 1, 2, 7, 5, 3, 1], 14), ([9], 9), ([0, 0, 0], 0),
         ([2, 1], 2), ([1, 2], 2), ([5, 0, 0, 5, 0, 0, 5], 15), ([400] * 100, 20000), (big, 10569)]
for nums, expected in cases:
    check(Solution().rob(list(nums)), expected, f'{nums[:10]}')
