from solution import *

cases = [
    ([-4, -1, 0, 3, 10], [0, 1, 9, 16, 100]),
    ([-7, -3, 2, 3, 11], [4, 9, 9, 49, 121]),
    ([1, 2, 3], [1, 4, 9]),
    ([-3, -2, -1], [1, 4, 9]),
    ([0], [0]),
    ([-5], [25]),
    ([0, 0, 0], [0, 0, 0]),
    ([-2, -2, 2, 2], [4, 4, 4, 4]),
    ([-10000, 10000], [100000000, 100000000]),
    (list(range(-500, 500)), sorted(x * x for x in range(-500, 500))),
]
for nums, expected in cases:
    check(Solution().sortedSquares(list(nums)), expected, f'{nums[:8]}')
