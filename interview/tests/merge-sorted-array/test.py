from solution import *

big1 = list(range(0, 2000, 2))
big2 = list(range(-1, 1999, 2))
cases = [([2, 5, 9], [4, 10]), ([1, 1], [1]), ([], [-3, 6]), ([7], []), ([4, 5, 6], [1, 2, 3]),
         ([1, 2, 3], [4, 5, 6]), ([-5, 0, 0], [-5, 0]), (big1, big2)]
for a, b in cases:
    nums1 = a + [0] * len(b)
    Solution().merge(nums1, len(a), list(b), len(b))
    check(nums1, sorted(a + b), f'{a[:5]} {b[:5]}')
