from solution import *


def normalise(combos):
    return sorted(sorted(c) for c in combos)


cases = [([3, 4, 5], 8, [[3, 5], [4, 4]]), ([6, 3, 9], 9, [[3, 3, 3], [3, 6], [9]]), ([2], 6, [[2, 2, 2]]), ([5], 3, []),
         ([2, 3, 5], 12, [[2, 2, 2, 2, 2, 2], [2, 2, 2, 3, 3], [2, 2, 3, 5], [2, 5, 5], [3, 3, 3, 3]]), ([7], 7, [[7]]),
         ([40, 2], 1, [])]
for candidates, target, expected in cases:
    check(normalise(Solution().combinationSum(list(candidates), target)), expected, f'{candidates} {target}')

# Larger case: 45 distinct combinations, each summing to 30 and using only the candidates.
got = normalise(Solution().combinationSum([7, 3, 2, 5], 30))
check(len(got), 45, 'count for [7, 3, 2, 5] 30')
check(all(sum(c) == 30 and set(c) <= {2, 3, 5, 7} for c in got), True, 'valid combinations')
check(len({tuple(c) for c in got}), 45, 'no duplicates')
