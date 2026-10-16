from solution import *

exact = [([4, 9], [[4, 9], [9, 4]]),
         ([1, 2, 3], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]),
         ([-5], [[-5]]),
         ([0, -10], [[-10, 0], [0, -10]])]
for nums, expected in exact:
    check(sorted(Solution().permute(list(nums))), expected, f'{nums}')

# Larger inputs: n! distinct lists, each a rearrangement of nums.
for nums, count in [([0, -1, 7, 2], 24), ([6, -2, 3, 10, -8, 1], 720)]:
    got = Solution().permute(list(nums))
    check(len(got), count, f'count {nums}')
    check(len({tuple(p) for p in got}), count, f'distinct {nums}')
    check(all(sorted(p) == sorted(nums) for p in got), True, f'each is a permutation {nums}')
