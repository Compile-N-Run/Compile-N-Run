from solution import *

cases = [([4, 9, -6], [4, 9]), ([7, -7], []), ([-3, -1, 2, 5], [-3, -1, 2, 5]), ([3, 5, -8, 2], [-8, 2]),
         ([10, 2, -5], [10]), ([1, -2, -3, 4], [-2, -3, 4]), ([5], [5]), ([-4], [-4]), ([6, 6, -6, -6], []),
         ([1] * 5000 + [-2], [-2]), ([1000] + [-1] * 5000, [1000])]
for asteroids, expected in cases:
    check(Solution().asteroidCollision(list(asteroids)), expected, f'size {len(asteroids)} {asteroids[:6]}')
