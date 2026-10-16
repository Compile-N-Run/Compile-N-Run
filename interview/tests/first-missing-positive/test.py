from solution import *

big = [-1 if v == 77777 else v for v in range(100000, 0, -1)]  # 1..100000 reversed, 77777 removed
cases = [([2, 5, 1, 9], 3), ([-4, 0, 6], 1), ([3, 1, 2, 2], 4), ([1], 2), ([2], 1), ([1, 1], 2), ([0], 1),
         ([7, 8, 9, 11, 12], 1), ([-2147483648, 2147483647, 1, 2], 3), ([4, 3, 2, 1], 5), (big, 77777)]
for nums, expected in cases:
    check(Solution().firstMissingPositive(list(nums)), expected, str(nums[:10]))
