from solution import *

big_ok = [1] * 10000
big_stuck = [1] * 10000
big_stuck[5000] = 0
cases = [([2, 0, 1, 0], True), ([1, 1, 0, 2], False), ([3, 0, 0, 0, 5], False), ([0], True), ([5], True),
         ([0, 1], False), ([2, 3, 0, 0, 1], True), ([4, 0, 0, 0, 0], True), ([1, 0, 1, 0], False),
         (big_ok, True), (big_stuck, False), ([10000] + [0] * 9999, True)]
for nums, expected in cases:
    check(Solution().canJump(list(nums)), expected, f'size {len(nums)} {nums[:6]}')
