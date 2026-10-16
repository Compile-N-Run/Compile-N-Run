from solution import *

evens, odds = list(range(-100, 100, 2)), list(range(-99, 101, 2))
cases = [([2, 5, 9], [1, 6], [1, 2, 5, 6, 9]), ([3, 3, 4], [3], [3, 3, 3, 4]), ([], [7, 8], [7, 8]), ([], [], []),
         ([1, 2, 3], [], [1, 2, 3]), ([-5, 0], [-10, -5, 20], [-10, -5, -5, 0, 20]), ([1], [2], [1, 2]),
         ([10, 11, 12], [1, 2, 3], [1, 2, 3, 10, 11, 12]), (evens, odds, list(range(-100, 100)))]
for a, b, expected in cases:
    check(list_values(Solution().mergeTwoLists(build_list(a), build_list(b))), expected, f'{a} + {b}')
