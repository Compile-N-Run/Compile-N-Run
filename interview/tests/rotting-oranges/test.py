from solution import *

big = [[1] * 10 for _ in range(10)]
big[0][0] = 2  # the far corner is 18 steps away
cases = [([[2, 1, 0], [1, 1, 1], [0, 1, 1]], 4), ([[2, 1, 1, 1, 2]], 2), ([[1, 0, 2]], -1), ([[0, 2], [0, 0]], 0),
         ([[1]], -1), ([[0]], 0), ([[2, 2], [1, 1], [0, 1]], 2), (big, 18), ([[1] * 10 for _ in range(10)], -1)]
for grid, expected in cases:
    check(Solution().orangesRotting([row[:] for row in grid]), expected, f'{grid[:3]}')
