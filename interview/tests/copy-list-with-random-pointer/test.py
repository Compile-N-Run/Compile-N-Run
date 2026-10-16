from solution import *


def build(spec):
    """spec: list of (val, random index or None). Returns the head."""
    nodes = [Node(v) for v, _ in spec]
    for i, (_, r) in enumerate(spec):
        if i + 1 < len(nodes):
            nodes[i].next = nodes[i + 1]
        if r is not None:
            nodes[i].random = nodes[r]
    return nodes[0] if nodes else None


def nodes_of(head):
    out = []
    while head:
        out.append(head)
        head = head.next
    return out


def describe(head):
    """Back to (val, random index) pairs; 'outside' marks a random pointer leaving the list."""
    nodes = nodes_of(head)
    index = {id(n): i for i, n in enumerate(nodes)}
    return [(n.val, None if n.random is None else index.get(id(n.random), 'outside')) for n in nodes]


cases = [[(4, 2), (8, None), (2, 0)], [(6, 0)], [(1, 1), (1, 0), (1, None)], [], [(1, None), (2, None), (3, None)],
         [(-10000, 4), (0, 4), (5, 4), (10000, 4), (7, 4)], [(3, 1), (9, 0)],
         [(i - 500, None if i % 5 == 0 else i * 7 % 1000) for i in range(1000)]]
for n, spec in enumerate(cases):
    head = build(spec)
    original_ids = {id(node) for node in nodes_of(head)}
    copy = Solution().copyRandomList(head)
    check(describe(copy), spec, f'case {n} copy')
    check(describe(head), spec, f'case {n} original changed')
    check(any(id(node) in original_ids for node in nodes_of(copy)), False, f'case {n} copy shares nodes with the original')
