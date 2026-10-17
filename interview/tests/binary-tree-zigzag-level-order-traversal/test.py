from solution import *

full = list(range(1, 1024))  # complete tree of 1023 nodes: level d holds 2**d .. 2**(d+1) - 1
full_want = [list(range(2 ** d, 2 ** (d + 1)))[::-1 if d % 2 else 1] for d in range(10)]
chain = [0] + [x for i in range(1, 300) for x in (i, None)]  # 0 -> 1 -> ... -> 299 down the left side
cases = [
    ([], []),
    ([8], [[8]]),
    ([1, 2, 3, 4, 5, 6, 7], [[1], [3, 2], [4, 5, 6, 7]]),
    ([4, 2, 7, 1, None, None, 9], [[4], [7, 2], [1, 9]]),
    ([1, 2, None, 3, None, 4], [[1], [2], [3], [4]]),
    ([1, None, 2, None, 3], [[1], [2], [3]]),
    ([1, 2, 3, 4, None, None, 5, None, 6, 7], [[1], [3, 2], [4, 5], [7, 6]]),
    ([0, -1, -2, -3, -4, -5, -6, -7], [[0], [-2, -1], [-3, -4, -5, -6], [-7]]),
    (full, full_want),
    (chain, [[i] for i in range(300)]),
]
for values, expected in cases:
    check(Solution().zigzagLevelOrder(build_tree(values)), expected, f'{values[:10]}')
