from solution import *

big = list(range(-2500, 2500))
cases = [[1, 2, 3, 4], [8, 5], [7], [], [3, 3, 1], [-5, 0, 5, -5], big]
for values in cases:
    check(list_values(Solution().reverseList(build_list(values))), values[::-1], f'{values[:10]}')
