from solution import *

cases = [([2, 1, 4, 5, 1, 3], 8), ([3, 3, 3], 9), ([1, 2, 3, 4, 5], 9), ([6, 0, 6], 6), ([7], 7), ([0, 0], 0),
         ([5, 4, 1, 2], 8), ([2, 4, 2, 4, 2], 10), (list(range(1, 1001)), 250500), ([10000] * 100000, 1000000000)]
for heights, expected in cases:
    check(Solution().largestRectangleArea(list(heights)), expected, str(heights[:8]))
