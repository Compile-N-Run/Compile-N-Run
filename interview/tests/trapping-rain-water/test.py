from solution import *

cases = [([3, 0, 2, 0, 4], 7), ([1, 2, 3, 4], 0), ([5, 1, 1, 5, 2, 4], 10), ([6], 0),
         ([2, 0, 2], 2), ([0, 0, 0], 0), ([5, 4, 3, 2, 1], 0), ([2, 1, 3, 1, 2], 2),
         ([100000] + [0] * 19998 + [100000], 100000 * 19998)]
for height, expected in cases:
    check(Solution().trap(list(height)), expected, f'{height[:8]}')
