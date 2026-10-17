from solution import *

full = [[1] * 50 for _ in range(50)]
checker = [[(r + c) % 2 for c in range(50)] for r in range(50)]  # every 1 touches only diagonally
stripes = [[1 if r % 2 == 0 else 0] * 50 for r in range(50)]  # 25 separate rows of 50
comb = [[1 if r == 0 or c % 2 == 0 else 0 for c in range(50)] for r in range(50)]  # one island: a top bar with 25 teeth
cases = [
    ([[0, 1, 1, 0], [0, 1, 0, 0], [1, 0, 0, 1]], 3),
    ([[1, 0, 1], [0, 1, 0], [1, 0, 1]], 1),
    ([[1, 1, 1], [1, 1, 1]], 6),
    ([[0, 0], [0, 0]], 0),
    ([[1]], 1),
    ([[0]], 0),
    ([[1, 1, 0, 0, 0], [1, 1, 0, 1, 1], [0, 0, 0, 1, 1], [0, 1, 0, 0, 1]], 5),
    ([[1, 0, 1, 1, 1, 0, 1]], 3),
    (full, 2500),
    (checker, 1),
    (stripes, 50),
    (comb, 50 + 25 * 49),
]
for grid, expected in cases:
    label = f'{len(grid)}x{len(grid[0])} {grid if len(grid[0]) <= 7 else "..."}'
    check(Solution().maxAreaOfIsland([row[:] for row in grid]), expected, label)
