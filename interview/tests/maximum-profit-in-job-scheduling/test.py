from solution import *

cases = [
    ([1, 2, 4], [3, 5, 6], [50, 10, 70], 120),
    ([1, 1, 1], [2, 3, 4], [5, 6, 4], 6),
    ([1, 3, 5], [3, 5, 7], [10, 10, 10], 30),
    ([2, 5, 1, 6], [4, 7, 8, 9], [30, 25, 100, 20], 100),
    ([4], [9], [7], 7),
    ([1, 2], [10, 3], [5, 5], 5),
    ([1, 2, 3], [4, 5, 6], [3, 3, 3], 3),
    ([1, 4, 2], [4, 6, 6], [5, 6, 10], 11),
    ([1, 999999999], [1000000000, 1000000000], [1, 2], 2),
]
# 10000 unit jobs in reverse order: all of them fit.
units = [(i, i + 1, 1) for i in reversed(range(10000))]
cases.append(([s for s, _, _ in units], [e for _, e, _ in units], [p for _, _, p in units], 10000))
# Unit jobs plus length-2 jobs worth 3: one unit job (0..1) then 5000 long jobs at 1, 3, ..., 9999.
mixed = units + [(i, i + 2, 3) for i in range(10000)]
cases.append(([s for s, _, _ in mixed], [e for _, e, _ in mixed], [p for _, _, p in mixed], 15001))
for start, end, profit, expected in cases:
    got = Solution().jobScheduling(list(start), list(end), list(profit))
    check(got, expected, f'start={start[:6]} end={end[:6]} profit={profit[:6]} (n={len(start)})')
