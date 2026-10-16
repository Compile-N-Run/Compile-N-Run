from solution import *

cases = [([5, 9, 2], 6, 3), ([10, 10], 2, 10), ([7], 7, 1), ([4, 1, 8], 5, 4), ([2, 2, 2], 3, 2),
         ([1, 1, 1, 1], 10, 1), ([1000000000], 2, 500000000), ([1000000000] * 10000, 1000000000, 10000),
         (list(range(1, 10001)), 10000, 10000)]
for piles, h, expected in cases:
    check(Solution().minEatingSpeed(list(piles), h), expected, f'{piles[:5]} h={h}')
