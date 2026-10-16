from solution import *

cases = [([10, 20, 30, 40, 50, 60, 70], 3, [30, 20, 10, 60, 50, 40, 70]), ([1, 2, 3, 4], 4, [4, 3, 2, 1]),
         ([5, 6, 7, 8, 9], 2, [6, 5, 8, 7, 9]), ([1, 2, 3], 1, [1, 2, 3]), ([42], 1, [42]),
         ([1, 2, 3, 4, 5, 6], 3, [3, 2, 1, 6, 5, 4]), ([0, 0, 1, 1, 2], 2, [0, 0, 1, 1, 2])]
# Larger cases: 5000 nodes in groups of 7 (2 left over) and one group of 5000.
big = list(range(5000))
expected7 = []
for i in range(0, 5000, 7):
    chunk = big[i:i + 7]
    expected7 += chunk[::-1] if len(chunk) == 7 else chunk
cases += [(big, 7, expected7), (big, 5000, big[::-1])]
for values, k, expected in cases:
    head = build_list(values)
    nodes = set()
    node = head
    while node:
        nodes.add(id(node))
        node = node.next
    result = Solution().reverseKGroup(head, k)
    check(list_values(result), expected, f'{values[:8]} k={k}')
    # The same node objects must be reused (values are not to be rewritten into new nodes).
    node = result
    while node:
        check(id(node) in nodes, True, f'k={k} reuses nodes')
        node = node.next
