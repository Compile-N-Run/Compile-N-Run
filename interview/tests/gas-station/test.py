from solution import *

big_gas, big_cost = [1] * 1000, [1] * 1000
big_gas[700], big_cost[699] = 2, 2
cases = [([2, 5, 1, 4], [3, 2, 4, 1], 1), ([1, 1, 1], [2, 1, 1], -1), ([0, 0, 7], [2, 3, 2], 2), ([3], [3], 0),
         ([5], [6], -1), ([4, 0, 2], [1, 3, 2], 0), (big_gas, big_cost, 700)]
for gas, cost, expected in cases:
    check(Solution().canCompleteCircuit(list(gas), list(cost)), expected, f'{gas[:6]} {cost[:6]}')
