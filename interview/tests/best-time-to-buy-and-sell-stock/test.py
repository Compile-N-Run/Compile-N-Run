from solution import *

# Large case: prices fall from 50000 to 1, then rise from 1 to 50000.
big = [50000 - i for i in range(50000)] + [i + 1 for i in range(50000)]
cases = [([9, 2, 6, 1, 4], 4), ([2, 9, 1, 8], 7), ([8, 6, 5, 3], 0), ([5], 0), ([3, 3, 3], 0), ([0, 10000], 10000),
         ([4, 1, 7, 0, 2], 6), (big, 49999)]
for prices, expected in cases:
    check(Solution().maxProfit(list(prices)), expected, f'{prices[:6]}')
