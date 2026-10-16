from solution import *

# Larger case: 100000 lines rising to 10000 and then staying flat; best pair is index 10000 with the last line.
big = [min(i, 10000) for i in range(100000)]
cases = [([2, 7, 4, 1, 6, 3], 18), ([5, 5], 5), ([1, 8, 1, 1, 8, 1], 24), ([0, 0], 0), ([3, 1], 1),
         ([1, 2, 3, 4, 5], 6), ([4, 3, 2, 1, 4], 16), ([10000, 10000], 10000), (big, 10000 * 89999)]
for height, expected in cases:
    check(Solution().maxArea(list(height)), expected, f'{height[:8]}')
