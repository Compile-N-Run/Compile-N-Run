from solution import *

evens = [2 * i for i in reversed(range(1000))]  # 1998, 1996, ..., 0: every neighbouring gap is 2
squares = [i * i for i in reversed(range(1000))]  # only 0 and 1 are 1 apart
cases = [
    ([4, 2, 1, 3], [[1, 2], [2, 3], [3, 4]]),
    ([1, 3, 6, 10, 15], [[1, 3]]),
    ([3, 8, -10, 23, 19, -4, -14, 27], [[-14, -10], [19, 23], [23, 27]]),
    ([10, 1, 100, 7], [[7, 10]]),
    ([1, 2], [[1, 2]]),
    ([-5, 5], [[-5, 5]]),
    ([1000000, -1000000], [[-1000000, 1000000]]),
    ([-3, -1, -2], [[-3, -2], [-2, -1]]),
    ([40, 11, 26, 27, 10], [[10, 11], [26, 27]]),
    (evens, [[2 * i, 2 * i + 2] for i in range(999)]),
    (squares, [[0, 1]]),
]
for arr, expected in cases:
    got = Solution().minimumAbsDifference(list(arr))
    check([list(p) for p in got], expected, f'{arr[:8]} (length {len(arr)})')
