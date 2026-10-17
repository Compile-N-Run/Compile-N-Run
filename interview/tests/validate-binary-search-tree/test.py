from solution import *

INT_MIN, INT_MAX = -2**31, 2**31 - 1


def balanced(lo, hi):  # a perfectly balanced BST holding lo..hi
    if lo > hi:
        return None
    mid = (lo + hi) // 2
    return TreeNode(mid, balanced(lo, mid - 1), balanced(mid + 1, hi))


chain = [1] + [x for i in range(2, 501) for x in (None, i)]  # 1 -> 2 -> ... -> 500 down the right side
dip = list(chain)
dip[2 * 249] = 100  # node 250 is replaced by 100, which is smaller than its ancestors
cases = [
    ([8, 3, 10], True),
    ([8, 3, 10, None, None, 6, 12], False),
    ([5, 5], False),
    ([INT_MAX], True),
    ([INT_MIN], True),
    ([INT_MIN, None, INT_MAX], True),
    ([INT_MAX, INT_MIN], True),
    ([INT_MIN, INT_MAX], False),
    ([3, 1, 5, 0, 2, 4, 6], True),
    ([3, 1, 5, 0, 4, 4, 6], False),
    ([10, 5, 15, None, None, 6, 20], False),
    ([10, 5, 15, None, None, 12, 20], True),
    (chain, True),
    (dip, False),
]
for values, expected in cases:
    check(Solution().isValidBST(build_tree(values)), expected, f'{values[:7]}')

big = balanced(1, 4095)
check(Solution().isValidBST(big), True, 'balanced BST of 1..4095')
node = big
while node.left:
    node = node.left
node.val = 5000  # the leftmost leaf now exceeds every ancestor
check(Solution().isValidBST(big), False, 'balanced BST of 1..4095 with leftmost leaf set to 5000')
