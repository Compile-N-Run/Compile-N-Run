from solution import *

three = [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
exact = [
    ([1, 2, 3], three),
    ([3, 1, 2], three),
    ([], [[]]),
    ([0], [[], [0]]),
    ([-1, 4], [[], [-1], [-1, 4], [4]]),
    ([5, -2, 7, 0], [[], [-2], [-2, 0], [-2, 0, 5], [-2, 0, 5, 7], [-2, 0, 7], [-2, 5], [-2, 5, 7], [-2, 7],
                     [0], [0, 5], [0, 5, 7], [0, 7], [5], [5, 7], [7]]),
]
for nums, expected in exact:
    got = Solution().subsets(list(nums))
    check(sorted(sorted(s) for s in got), expected, f'{nums}')
# Larger inputs: 2^n distinct subsets, each made of distinct elements of nums.
for nums in [list(range(1, 11)), list(range(-6, 6))]:
    got = Solution().subsets(list(nums))
    normalised = [tuple(sorted(s)) for s in got]
    check(len(got), 2 ** len(nums), f'count for {nums}')
    check(len(set(normalised)), 2 ** len(nums), f'distinct for {nums}')
    for s in normalised:
        check(len(set(s)) == len(s) and set(s) <= set(nums), True, f'{nums}: invalid subset {list(s)}')
