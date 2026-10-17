from solution import *

ordered = [[r * 200 + c for c in range(200)] for r in range(200)]  # only right/down steps: 199 + 199 + 1
snake = [[r * 20 + (c if r % 2 == 0 else 19 - c) for c in range(20)] for r in range(20)]  # one path over all cells
cases = [
    ([[1, 2, 3], [6, 5, 4], [7, 8, 9]], 9),
    ([[9, 1], [8, 2]], 4),
    ([[5, 5], [5, 5]], 1),
    ([[7]], 1),
    ([[3, 4, 5], [3, 2, 6], [2, 2, 1]], 4),
    ([[-3, -2], [0, -1]], 4),
    ([[1, 2], [2, 1]], 2),
    ([[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], 10),
    (ordered, 399),
    (snake, 400),
]
for matrix, expected in cases:
    label = f'{len(matrix)}x{len(matrix[0])} {matrix[:3] if len(matrix) <= 3 else "..."}'
    check(Solution().longestIncreasingPath([row[:] for row in matrix]), expected, label)
