from solution import *


def valid(n, prereq, order, possible):
    """Any topological order is accepted; an impossible schedule must give []."""
    if not possible:
        return order == []
    if sorted(order) != list(range(n)):
        return False
    pos = {c: i for i, c in enumerate(order)}
    return all(pos[b] < pos[a] for a, b in prereq)


chain = [[i - 1, i] for i in range(1, 2000)]  # course i before course i - 1
cases = [(3, [[1, 0], [2, 1]], True), (4, [[1, 0], [2, 0], [3, 1], [3, 2]], True), (3, [[0, 2], [2, 0]], False),
         (3, [], True), (1, [], True), (3, [[0, 1], [1, 2], [2, 0]], False),
         (6, [[5, 4], [4, 3], [0, 5], [2, 1]], True), (2000, chain, True), (2000, chain + [[1999, 0]], False)]
for i, (n, prereq, possible) in enumerate(cases):
    got = Solution().findOrder(n, [p[:] for p in prereq])
    check(valid(n, prereq, list(got), possible), True, f'case {i}: got {got[:10]}')
