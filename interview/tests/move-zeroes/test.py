from solution import *

big = [0 if i % 3 == 0 else i for i in range(10000)]
big_expected = [x for x in big if x != 0] + [0] * big.count(0)
cases = [([4, 0, 5, 0, 0, 9], [4, 5, 9, 0, 0, 0]), ([0, 0, 7], [7, 0, 0]), ([-3, 2], [-3, 2]), ([0], [0]),
         ([5], [5]), ([0, 0, 0], [0, 0, 0]), ([0, 1, 0, 3, 12], [1, 3, 12, 0, 0]), ([2, 0, 2, 0, -1], [2, 2, -1, 0, 0]),
         (big, big_expected)]
for nums, expected in cases:
    arr = list(nums)
    result = Solution().moveZeroes(arr)
    check(result, None, 'returns nothing')
    check(arr, expected, str(nums[:10]))
