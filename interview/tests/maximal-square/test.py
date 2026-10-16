from solution import *

big = ['1' * 100] * 50 + ['0' * 100] + ['1' * 100] * 49
cases = [(['110', '111', '011'], 4), (['00', '00'], 0), (['1'], 1), (['1111', '1111', '1110'], 9), (['0'], 0),
         (['10111'], 1), (['01', '10'], 1), (['10111', '11111', '01111', '11110'], 9), (big, 2500)]
for rows, expected in cases:
    check(Solution().maximalSquare([list(r) for r in rows]), expected, str(rows[:4]))
