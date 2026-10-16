from solution import *

cases = [(7, True), (4, False), (1, True), (100, True), (2, False), (2**31 - 1, False), (1111111, True), (999999999, False)]
for n, expected in cases:
    check(Solution().isHappy(n), expected, f'n={n}')

# Every number up to 100, compared with the known list of happy numbers.
happy = {1, 7, 10, 13, 19, 23, 28, 31, 32, 44, 49, 68, 70, 79, 82, 86, 91, 94, 97, 100}
for n in range(1, 101):
    check(Solution().isHappy(n), n in happy, f'n={n}')
