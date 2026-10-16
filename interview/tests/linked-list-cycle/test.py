from solution import *


def build(values, pos):
    """Build the list and point the tail at node `pos` (-1 for no cycle)."""
    head = build_list(values)
    if pos >= 0:
        tail = target = head
        while tail.next:
            tail = tail.next
        for _ in range(pos):
            target = target.next
        tail.next = target
    return head


big = list(range(10000))
cases = [([5, 8, 2, 9], 1, True), ([1, 2], 0, True), ([4, 4, 4], -1, False), ([7], 0, True), ([], -1, False),
         ([7], -1, False), ([1, 2, 3, 4, 5], 4, True), ([1, 2, 3, 4, 5, 6], -1, False), ([3, 3, 3, 3], 3, True),
         (big, -1, False), (big, 5000, True), (big, 0, True), (big, 9999, True)]
for values, pos, expected in cases:
    check(Solution().hasCycle(build(values, pos)), expected, f'{values[:6]} pos={pos}')
