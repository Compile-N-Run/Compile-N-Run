from solution import *


def grid(n):
    return [[i * n + j for j in range(n)] for i in range(n)]


def rotated(m):  # reference: copy into a new matrix
    n = len(m)
    out = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            out[j][n - 1 - i] = m[i][j]
    return out


cases = [([[1, 2], [3, 4]], [[3, 1], [4, 2]]),
         ([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[7, 4, 1], [8, 5, 2], [9, 6, 3]]),
         ([[5]], [[5]]),
         ([[-1, 0], [0, -1]], [[0, -1], [-1, 0]]),
         ([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]],
          [[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]]),
         (grid(5), rotated(grid(5))),
         (grid(20), rotated(grid(20)))]
for matrix, expected in cases:
    m = [row[:] for row in matrix]
    result = Solution().rotate(m)
    check(result, None, f'{len(m)}x{len(m)} returns nothing')
    check(m, expected, f'{len(m)}x{len(m)}')
