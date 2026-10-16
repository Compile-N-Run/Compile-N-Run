from solution import *

cases = [
    ([[6, 8], [1, 4], [3, 5]], [[1, 5], [6, 8]]),
    ([[2, 4], [4, 7]], [[2, 7]]),
    ([[1, 10], [2, 3], [4, 5]], [[1, 10]]),
    ([[5, 5]], [[5, 5]]),
    ([[1, 2], [3, 4]], [[1, 2], [3, 4]]),
    ([[0, 0], [0, 0]], [[0, 0]]),
    ([[4, 9], [1, 3], [2, 4]], [[1, 9]]),
    ([[2 * i, 2 * i + 1] for i in reversed(range(1000))], [[2 * i, 2 * i + 1] for i in range(1000)]),
    ([[i, i + 1] for i in reversed(range(1000))], [[0, 1000]]),
]
for intervals, expected in cases:
    got = Solution().merge([list(iv) for iv in intervals])
    check(sorted(list(iv) for iv in got), expected, f'{intervals[:4]}')
