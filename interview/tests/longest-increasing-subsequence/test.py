from solution import *

cases = [([4, 1, 6, 2, 7, 3, 8], 4), ([5, 5, 5], 1), ([9, 7, 4, 2], 1), ([-3, 10, -1, 0, 2], 4), ([7], 1),
         ([1, 3, 2, 3, 4, 0], 4), (list(range(2500)), 2500), ([i // 2 for i in range(2000)], 1000)]
for nums, expected in cases:
    check(Solution().lengthOfLIS(list(nums)), expected, str(nums[:8]))
