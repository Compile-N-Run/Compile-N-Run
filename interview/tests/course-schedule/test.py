from solution import *

chain = [[i, i - 1] for i in range(1, 2000)]
cases = [(3, [[1, 0], [2, 1]], True), (2, [[0, 1], [1, 0]], False), (4, [], True),
         (4, [[1, 0], [2, 1], [3, 2], [1, 3]], False), (1, [], True),
         (5, [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]], True), (3, [[0, 1], [1, 2], [2, 0]], False),
         (2000, chain, True), (2000, chain + [[0, 1999]], False)]
for n, prereq, expected in cases:
    check(Solution().canFinish(n, [list(p) for p in prereq]), expected, f'{n} {prereq[:5]}')
