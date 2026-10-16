from solution import *

big = list(range(99999, -1, -2)) + list(range(0, 100000, 2)) + [200000, -5]
cases = [([10, 4, 20, 1, 3, 2], 4), ([5, -1, 0, 7, 1, 6, 1], 3), ([42], 1), ([], 0),
         ([7, 7, 7], 1), ([1, 3, 5, 7], 1), ([-1000000000, 1000000000, 0, -999999999], 2),
         ([9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6], 7), (big, 100000)]
for nums, expected in cases:
    check(Solution().longestConsecutive(list(nums)), expected, f'{nums[:10]}')
