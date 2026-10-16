from solution import *


def spiral_filled(m, n):
    """m x n matrix whose spiral order is 0, 1, 2, ... (filled by a turning walker)."""
    grid = [[None] * n for _ in range(m)]
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    i = j = d = 0
    for v in range(m * n):
        grid[i][j] = v
        ni, nj = i + dirs[d][0], j + dirs[d][1]
        if not (0 <= ni < m and 0 <= nj < n) or grid[ni][nj] is not None:
            d = (d + 1) % 4
            ni, nj = i + dirs[d][0], j + dirs[d][1]
        i, j = ni, nj
    return grid


cases = [([[10, 20, 30], [40, 50, 60], [70, 80, 90]], [10, 20, 30, 60, 90, 80, 70, 40, 50]),
         ([[1, 2, 3, 4], [5, 6, 7, 8]], [1, 2, 3, 4, 8, 7, 6, 5]), ([[7], [8], [9]], [7, 8, 9]), ([[5]], [5]),
         ([[1, 2, 3]], [1, 2, 3]), ([[1, 2], [3, 4], [5, 6]], [1, 2, 4, 6, 5, 3]),
         ([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]], [1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8]),
         ([[-1, -2], [-3, -4]], [-1, -2, -4, -3])]
for m, n in [(10, 7), (7, 10), (10, 10)]:
    cases.append((spiral_filled(m, n), list(range(m * n))))
for matrix, expected in cases:
    check(Solution().spiralOrder([row[:] for row in matrix]), expected, f'{len(matrix)}x{len(matrix[0])}')
