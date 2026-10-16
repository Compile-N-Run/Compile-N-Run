from solution import *

cases = [
    ([[1, 2, 3], [4, 0, 6], [7, 8, 9]], [[1, 0, 3], [0, 0, 0], [7, 0, 9]]),
    ([[0, 5], [7, 8]], [[0, 0], [0, 8]]),
    ([[1, 1, 1], [0, 1, 1]], [[0, 1, 1], [0, 0, 0]]),
    ([[3, 4], [5, 6]], [[3, 4], [5, 6]]),
    ([[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]], [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]),
    ([[1]], [[1]]),
    ([[0]], [[0]]),
    ([[1, 0, 3]], [[0, 0, 0]]),
    ([[1], [0], [3]], [[0], [0], [0]]),
    ([[1, 0], [1, 1], [1, 1]], [[0, 0], [1, 0], [1, 0]]),
    ([[-1, 5], [0, -7]], [[0, 5], [0, 0]]),
    ([[1, 2, 3], [4, 5, 6], [7, 8, 0]], [[1, 2, 0], [4, 5, 0], [0, 0, 0]]),
]
# 200 x 200 with zeros on the diagonal at every 50th row: rows and columns 0, 50, 100, 150 are cleared.
big = [[0 if r == c and r % 50 == 0 else 1 for c in range(200)] for r in range(200)]
big_want = [[0 if r % 50 == 0 or c % 50 == 0 else 1 for c in range(200)] for r in range(200)]
cases.append((big, big_want))
for matrix, expected in cases:
    work = [list(row) for row in matrix]
    Solution().setZeroes(work)
    check(work, expected, f'{matrix[:3]}')
