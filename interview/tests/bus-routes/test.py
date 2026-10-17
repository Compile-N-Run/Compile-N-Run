from solution import *

cases = [
    ([[10, 20, 30], [30, 40, 50]], 10, 50, 2),
    ([[1, 2, 3]], 1, 3, 1),
    ([[1, 2], [3, 4]], 1, 4, -1),
    ([[5, 6]], 5, 5, 0),
    ([[1, 2, 3, 4, 5], [2, 10], [5, 10]], 1, 10, 2),
    ([[1, 2, 3], [3, 4]], 1, 3, 1),
    ([[1, 9], [2, 3, 8], [4], [8, 11], [5, 9, 10]], 8, 9, -1),
    ([[1, 2], [2, 3], [3, 4], [4, 5]], 1, 5, 4),
    ([[7, 8]], 1, 8, -1),  # source is not on any route
    ([[i, i + 1] for i in range(500)], 0, 500, 500),  # a chain of 500 buses
    ([[0, i] for i in range(1, 1001)], 1, 1000, 2),  # a star: every route passes the hub 0
    ([list(range(i, i + 1000)) for i in range(0, 50000, 500)], 0, 49999 + 500, 100),  # long overlapping routes
]
for routes, source, target, expected in cases:
    got = Solution().numBusesToDestination([list(r) for r in routes], source, target)
    check(got, expected, f'{len(routes)} routes {str(routes)[:40]} {source}->{target}')
