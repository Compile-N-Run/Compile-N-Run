from solution import *

ones = [1] * 1023                              # complete tree, 10 levels: leaf-to-leaf through the root = 19 nodes
negatives = [-(i % 5 + 1) for i in range(1023)]  # all negative: the best path is one node, -1
cases = [([2, 1, 3], 6), ([-8, 4, 6, None, None, 5, 7], 18), ([-3], -3), ([-2, -5, -1], -1),
         ([1, -2, 3], 4), ([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1], 48),
         ([-10, 9, 20, None, None, 15, -7], 35), (ones, 19), (negatives, -1)]
for values, expected in cases:
    check(Solution().maxPathSum(build_tree(values)), expected, f'{values[:15]}')
