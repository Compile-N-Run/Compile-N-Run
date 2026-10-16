from solution import *

cases = [([1, 3, 2], [2, 1, 3]), ([5, 4, 3], [3, 4, 5]), ([2, 2, 7], [2, 7, 2]),
         ([1, 5, 8, 4, 7, 6, 5, 3, 1], [1, 5, 8, 5, 1, 3, 4, 6, 7]), ([1], [1]), ([1, 1], [1, 1]), ([1, 2], [2, 1]),
         ([3, 1, 2], [3, 2, 1]), ([1, 5, 1], [5, 1, 1]), ([2, 3, 1, 3, 3], [2, 3, 3, 1, 3]), ([0, -1, 4], [0, 4, -1]),
         (list(range(1000)), list(range(998)) + [999, 998]), (list(range(999, -1, -1)), list(range(1000)))]
for nums, expected in cases:
    arr = list(nums)
    check(Solution().nextPermutation(arr), None, f'return value for {nums[:6]}')
    check(arr, expected, f'size {len(nums)} {nums[:6]}')
