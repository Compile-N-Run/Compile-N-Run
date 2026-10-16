from solution import *

big = [v for v in range(100) for _ in range(v + 1)]  # value v appears v + 1 times
cases = [([5, 7, 5, 9, 7, 5], 2, [5, 7]), ([-3, -3, 4], 1, [-3]), ([8, 2, 6], 3, [2, 6, 8]),
         ([1], 1, [1]), ([4, 4, 4, 4], 1, [4]), ([-1, -1, 0, 0, 0, 2], 2, [-1, 0]),
         (big, 5, [95, 96, 97, 98, 99])]
for nums, k, expected in cases:
    check(sorted(Solution().topKFrequent(list(nums), k)), expected, f'{nums[:10]} k={k}')
