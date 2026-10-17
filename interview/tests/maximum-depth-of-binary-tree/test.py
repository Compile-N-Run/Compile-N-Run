from solution import *

chain = [0] + [x for i in range(1, 500) for x in (i, None)]  # 0 -> 1 -> ... -> 499 down the left side
cases = [
    ([], 0),
    ([7], 1),
    ([5, 3, 8, None, 4], 3),
    ([1, None, 2, None, 3, None, 4], 4),
    ([1, 2, 3, 4, 5, 6, 7], 3),
    ([1, 2], 2),
    ([1, 2, 3, 4, 5, 6, 7, 8], 4),
    ([-1, -2, None, -3, None, None, -4], 4),
    (list(range(1, 1024)), 10),  # complete tree of 1023 nodes
    (chain, 500),
]
for values, expected in cases:
    check(Solution().maxDepth(build_tree(values)), expected, f'{values[:9]}')
