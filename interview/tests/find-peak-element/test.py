from solution import *


def is_peak(nums, i):
    return (isinstance(i, int) and 0 <= i < len(nums) and (i == 0 or nums[i] > nums[i - 1])
            and (i == len(nums) - 1 or nums[i] > nums[i + 1]))


MIN = -2 ** 31
cases = [[2, 5, 3], [1, 3, 2, 6, 4], [9, 7, 4], [1, 2, 3, 4], [7], [MIN], [MIN, MIN + 1], [3, 1],
         [2 ** 31 - 1, MIN, 2 ** 31 - 1], [i % 2 for i in range(10001)],
         [i if i < 7000 else 14000 - i for i in range(10000)]]
for nums in cases:
    got = Solution().findPeakElement(list(nums))
    check(is_peak(nums, got), True, f'size {len(nums)} {nums[:6]} returned {got}')
