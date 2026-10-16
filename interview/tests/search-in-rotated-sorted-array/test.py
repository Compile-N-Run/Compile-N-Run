from solution import *

cases = [([15, 18, 22, 3, 7, 11], 7, 4), ([15, 18, 22, 3, 7, 11], 20, -1), ([30, 40, 50, 10, 20], 40, 1), ([9], 9, 0),
         ([9], 4, -1), ([2, 1], 1, 1), ([1, 2, 3, 4, 5], 5, 4), ([5, 1, 3], 5, 0), ([5, 1, 3], 3, 2), ([-8, -5, -10], -10, 2)]
for nums, target, expected in cases:
    check(Solution().search(list(nums), target), expected, f'{nums} {target}')

# Exhaustive: every rotation of small arrays of even numbers, every target (odd ones are missing).
for n in (1, 2, 3, 7, 50):
    for r in range(n):
        nums = [2 * ((j + r) % n) for j in range(n)]
        for t in range(-1, 2 * n + 1):
            expected = (t // 2 - r) % n if t % 2 == 0 and 0 <= t < 2 * n else -1
            check(Solution().search(nums, t), expected, f'n={n} r={r} t={t}')

big = list(range(1234, 5000)) + list(range(1234))  # 5000 values, rotated
check(Solution().search(big, 0), 3766, 'big 0')
check(Solution().search(big, 4999), 3765, 'big 4999')
check(Solution().search(big, 5000), -1, 'big 5000')
