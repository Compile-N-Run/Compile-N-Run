from solution import *

big = [i // 10 for i in range(100000)]  # each value 0..9999 appears 10 times
cases = [([1, 3, 3, 3, 6, 9], 3, [1, 3]), ([2, 4, 4, 8], 5, [-1, -1]), ([7], 7, [0, 0]), ([], 0, [-1, -1]),
         ([5, 5, 5, 5], 5, [0, 3]), ([1, 2, 3], 0, [-1, -1]), ([1, 2, 3], 4, [-1, -1]), ([-3, -1, -1, 0], -1, [1, 2]),
         ([1, 2, 3, 3], 3, [2, 3]), (big, 4321, [43210, 43219]), (big, 10000, [-1, -1])]
for nums, target, expected in cases:
    check(Solution().searchRange(list(nums), target), expected, f'{nums[:10]} {target}')
