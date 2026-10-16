from solution import *


def same_tree(a, b):
    if a is None or b is None:
        return a is b
    return a.val == b.val and same_tree(a.left, b.left) and same_tree(a.right, b.right)


chain = [0] + [x for i in range(1, 500) for x in (i, None)]  # 0 -> 1 -> ... -> 499 down the left side
full = list(range(1, 1024))  # complete tree of 1023 nodes
cases = [
    [],
    [1],
    [1, 2, 3, None, None, 4, 5],
    [-5, None, 7],
    [100, 20, 300],
    [0, 0, 0],
    [1, None, 2, None, 3],
    [-1, -2, -3, -4, None, None, -5],
    [2147483647, -2147483648],
    [7, 7, None, 7, None, 7],
    chain,
    full,
]
for values in cases:
    root = build_tree(values)
    ser, deser = Codec(), Codec()  # separate instances, as LeetCode calls them
    data = ser.serialize(root)
    check(isinstance(data, str), True, f'{values[:8]}: serialize must return a string')
    got = deser.deserialize(data)
    check(same_tree(got, build_tree(values)), True, f'{values[:8]} (n={len(values)}): round trip changed the tree')
    if root is not None:
        check(got is not root, True, f'{values[:8]}: deserialize must build a new tree')
    # The rebuilt tree must serialize and rebuild again just as well.
    again = Codec().deserialize(Codec().serialize(got))
    check(same_tree(again, build_tree(values)), True, f'{values[:8]} (n={len(values)}): second round trip')
