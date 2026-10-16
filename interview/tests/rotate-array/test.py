from solution import *

n = 100000
big = list(range(n))
big_expected = [(i - 23456) % n for i in range(n)]  # k = 123456 is 23456 after wrapping
cases = [([10, 20, 30, 40, 50], 2, [40, 50, 10, 20, 30]), ([1, 2, 3], 4, [3, 1, 2]), ([-5, 8], 0, [-5, 8]), ([9], 7, [9]),
         ([1, 2, 3, 4], 4, [1, 2, 3, 4]), ([1, 2, 3, 4, 5, 6, 7], 3, [5, 6, 7, 1, 2, 3, 4]), ([1, 2], 1, [2, 1]),
         ([4, 4, 1, 4], 3, [4, 1, 4, 4]), (big, 123456, big_expected)]
for nums, k, expected in cases:
    arr = list(nums)
    result = Solution().rotate(arr, k)
    check(result, None, 'returns nothing')
    check(arr, expected, f'{nums[:10]} k={k}')
