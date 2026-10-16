from solution import *

big = [i % 10 for i in range(10000)]  # 1000 climbs from 0 to 9
cases = [([3, 1, 4, 2, 6], 7), ([2, 3, 5, 8], 6), ([9, 7, 4, 1], 0), ([5], 0), ([4, 4, 4], 0), ([0, 10000], 10000),
         ([7, 1, 5, 3, 6, 4], 7), ([1, 5, 5, 2, 8], 10), (big, 9000)]
for prices, expected in cases:
    check(Solution().maxProfit(list(prices)), expected, str(prices[:10]))
