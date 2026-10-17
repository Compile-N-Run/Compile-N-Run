from solution import *

full = list(range(1, 1024))  # complete tree of 1023 nodes: 9 edges down each side
chain = [0] + [x for i in range(1, 1000) for x in (i, None)]  # 0 -> 1 -> ... -> 999 down the left side
cases = [
    ([1, 2, 3, 4, 5], 3),
    ([1], 0),
    ([1, None, 2], 1),
    ([1, 2, None, 3, 4, 5, None, None, 6, 7], 5),  # longest path avoids the root
    ([1, 2, 3], 2),
    ([1, 2, None, 3, None, 4], 3),  # a chain of four
    ([1, 2, 3, 4, 5, 6, 7], 4),
    ([1, 2, 3, 4, None, None, 5], 4),
    ([-7, -7, -7, None, 3], 3),  # values do not matter
    ([], 0),  # no tree at all
    (full, 18),
    (chain, 999),
]
for values, expected in cases:
    got = Solution().diameterOfBinaryTree(build_tree(values))
    check(got, expected, f'tree={values[:10]}{"..." if len(values) > 10 else ""} ({len(values)} entries)')
