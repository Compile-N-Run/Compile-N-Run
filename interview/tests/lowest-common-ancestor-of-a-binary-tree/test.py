from solution import *


def find(root, val):
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        if node.val == val:
            return node
        stack += [node.left, node.right]
    raise ValueError(f'{val} not in tree')


def heap_lca(a, b):  # in a level-order tree of 1..n, node i's parent is i // 2
    while a != b:
        if a > b:
            a //= 2
        else:
            b //= 2
    return a


example = [10, 4, 15, 1, 7, None, 20, None, None, 6, 9]
full = list(range(1, 1024))  # complete tree of 1023 nodes
chain = [0] + [x for i in range(1, 500) for x in (i, None)]  # 0 -> 1 -> ... -> 499 down the left side
cases = [(example, 6, 9, 7), (example, 1, 9, 4), (example, 4, 6, 4), (example, 9, 20, 10), (example, 15, 20, 15),
         ([1, 2], 1, 2, 1), ([1, 2], 2, 1, 1), ([0, -5, 8, None, -3], -3, 8, 0),
         (full, 1000, 1023, heap_lca(1000, 1023)), (full, 1000, 1001, 500), (full, 512, 1023, 1), (chain, 499, 200, 200)]
for values, p, q, expected in cases:
    root = build_tree(values)
    got = Solution().lowestCommonAncestor(root, find(root, p), find(root, q))
    check(got is find(root, expected), True, f'{values[:11]} p={p} q={q} got {got.val if got else None}')
