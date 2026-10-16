from solution import *

big = [list(range(j, 5000, 50)) for j in range(50)]  # 50 interleaved lists covering 0..4999
cases = [([[1, 4, 9], [2, 3], [5, 6, 10]], [1, 2, 3, 4, 5, 6, 9, 10]), ([[], [-3, 0]], [-3, 0]),
         ([[7], [7, 8]], [7, 7, 8]), ([], []), ([[]], []), ([[5]], [5]),
         ([[-2, -1], [-3], [0, 0], [], [-5, 10]], [-5, -3, -2, -1, 0, 0, 10]), (big, list(range(5000)))]
for lists, expected in cases:
    check(list_values(Solution().mergeKLists([build_list(v) for v in lists])), expected, f'{lists[:5]}')
