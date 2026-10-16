from solution import *


def normalise(triplets):
    return sorted(sorted(t) for t in triplets)


# Larger case: values -6..6, each at least 15 times, so every value triple summing to 0 is present.
big = [(i * 7) % 13 - 6 for i in range(200)]
big_expected = [[a, b, -a - b] for a in range(-6, 7) for b in range(a, 7) if b <= -a - b <= 6]
cases = [([-4, 1, 3, 2, -1, -2], [[-4, 1, 3], [-2, -1, 3]]), ([-2, 1, 1, -2, 4, 0], [[-2, -2, 4], [-2, 1, 1]]),
         ([0, 0, 0, 0], [[0, 0, 0]]), ([2, 5, -1], []), ([-2, 0, 0, 2, 2], [[-2, 0, 2]]),
         ([-1, 0, 1, 2, -1, -4], [[-1, -1, 2], [-1, 0, 1]]), ([1, 2, -2, -1], []), (big, big_expected)]
for nums, expected in cases:
    check(normalise(Solution().threeSum(list(nums))), normalise(expected), f'{nums[:10]}')
