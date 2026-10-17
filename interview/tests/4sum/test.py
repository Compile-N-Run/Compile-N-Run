from solution import *


def normalise(quads):  # any order is valid: sort inside each quadruplet and sort the list
    return sorted(sorted(q) for q in quads)


cases = [
    ([1, 0, -1, 0, -2, 2], 0, [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]),
    ([2, 2, 2, 2, 2], 8, [[2, 2, 2, 2]]),
    ([-3, -1, 0, 2, 4, 5], 2, [[-3, -1, 2, 4]]),
    ([1, 2, 3], 6, []),
    ([], 0, []),
    ([0, 0, 0, 0], 0, [[0, 0, 0, 0]]),
    ([0, 0, 0, 0], 1, []),
    ([-5, -4, -3, -2, -1], -10, [[-4, -3, -2, -1]]),
    ([1, -2, -5, -4, -3, 3, 3, 5], -11, [[-5, -4, -3, 1]]),
    ([1000000000, 1000000000, 1000000000, 1000000000], -294967296, []),  # a 32-bit sum wraps to the target
    ([-1000000000, -1000000000, 1000000000, 1000000000], 0, [[-1000000000, -1000000000, 1000000000, 1000000000]]),
    ([i % 10 for i in range(200)], 18,
     [[a, b, c, d] for a in range(10) for b in range(a, 10) for c in range(b, 10) for d in range(c, 10) if a + b + c + d == 18]),
]
for nums, target, expected in cases:
    got = Solution().fourSum(list(nums), target)
    check(normalise(got), expected, f'{nums[:8]} (length {len(nums)}) target {target}')

distinct = list(range(-50, 50))  # 100 distinct values: 26536 quadruplets sum to 0
got = Solution().fourSum(list(distinct), 0)
check(len(got), 26536, 'range(-50, 50) target 0: number of quadruplets')
check(len(set(tuple(sorted(q)) for q in got)) == len(got) and all(sum(q) == 0 for q in got), True,
      'range(-50, 50) target 0: all distinct and each sums to 0')
