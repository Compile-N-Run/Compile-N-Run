from solution import *


def build(adj):
    """adj[i] lists the (1-based) neighbours of node i + 1. Returns node 1, or None for an empty graph."""
    nodes = [Node(i + 1) for i in range(len(adj))]
    for node, neighbours in zip(nodes, adj):
        node.neighbors = [nodes[j - 1] for j in neighbours]
    return nodes[0] if nodes else None


def nodes_of(start):
    """Every node reachable from start, each object once."""
    seen, stack = {}, [start] if start else []
    while stack:
        node = stack.pop()
        if id(node) in seen:
            continue
        seen[id(node)] = node
        stack.extend(node.neighbors)
    return list(seen.values())


def describe(start):
    """Back to an adjacency list; a string describes what is wrong when the values are not 1..n once each."""
    nodes = nodes_of(start)
    by_val = {}
    for node in nodes:
        if node.val in by_val:
            return f'two nodes with value {node.val}'
        by_val[node.val] = node
    if sorted(by_val) != list(range(1, len(nodes) + 1)):
        return f'values {sorted(by_val)}'
    return [[nb.val for nb in by_val[v].neighbors] for v in range(1, len(nodes) + 1)]


def ring_with_chords(n):  # node i joined to its two ring neighbours and to the node opposite it
    return [[(i - 2) % n + 1, i % n + 1, (i + n // 2 - 1) % n + 1] for i in range(1, n + 1)]


cases = [
    [[2, 4], [1, 3], [2, 4], [1, 3]],  # a square
    [[]],  # a single node
    [],  # empty graph
    [[2], [1]],
    [[2, 3], [1, 3], [1, 2]],  # a triangle
    [[2], [1, 3], [2, 4], [3, 5], [4]],  # a path
    [[2, 3, 4, 5, 6], [1], [1], [1], [1], [1]],  # a star
    [[2, 3, 4], [1, 3], [1, 2, 4], [1, 3]],
    ring_with_chords(100),  # the largest allowed graph
]
for adj in cases:
    start = build(adj)
    original_ids = {id(node) for node in nodes_of(start)}
    clone = Solution().cloneGraph(start)
    label = f'graph={adj[:4]}{"..." if len(adj) > 4 else ""} ({len(adj)} nodes)'
    if not adj:
        check(clone, None, label + ' clone')
        continue
    check(describe(clone), adj, label + ' clone')
    check(describe(start), adj, label + ' original changed')
    check(any(id(node) in original_ids for node in nodes_of(clone)), False, label + ' clone shares nodes with the original')
