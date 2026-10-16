from solution import *

cases = [[2, 1, 0, 2, 0, 1], [1, 2, 1], [2, 2, 0], [1], [2, 0], [1, 0], [0, 0, 0], [2, 1, 0],
         [(i * 7 + i // 3) % 3 for i in range(1000)]]
for nums in cases:
    got = list(nums)
    Solution().sortColors(got)
    check(got, sorted(nums), f'{nums[:10]}')
