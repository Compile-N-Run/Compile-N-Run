from solution import *

grid = [[2, 4, 6], [9, 11, 13], [20, 25, 30]]
cases = [
    (grid, 11, True),
    (grid, 12, False),
    (grid, 2, True),
    (grid, 30, True),
    (grid, 1, False),
    (grid, 31, False),
    (grid, 9, True),
    ([[7]], 7, True),
    ([[7]], 8, False),
    ([[1, 2, 3, 4, 5]], 4, True),  # a single row
    ([[1, 2, 3, 4, 5]], 0, False),
    ([[1], [3], [5]], 3, True),  # a single column
    ([[1], [3], [5]], 4, False),
    ([[-9, -7], [-5, -3], [-1, 0]], -3, True),  # negatives
    ([[-9, -7], [-5, -3], [-1, 0]], -4, False),
]
for matrix, target, expected in cases:
    check(Solution().searchMatrix([list(r) for r in matrix], target), expected, f'{str(matrix)[:30]} target={target}')

# Larger case: a 100 x 100 matrix of even numbers; every even value is found and no odd one is.
big = [[2 * (i * 100 + j) for j in range(100)] for i in range(100)]
check(all(Solution().searchMatrix(big, 2 * k) for k in range(10000)), True, '100x100 all even values present')
check(any(Solution().searchMatrix(big, 2 * k + 1) for k in range(10000)), False, '100x100 no odd value present')
check(Solution().searchMatrix(big, 20000), False, '100x100 target past the end')
