from solution import *

big = [50] * 999 + [60]
cases = [([70, 68, 69, 72, 71], [3, 1, 1, 0, 0]), ([50, 50, 50], [0, 0, 0]), ([30, 40, 50], [1, 1, 0]),
         ([80, 60, 70, 90], [3, 1, 1, 0]), ([55], [0]), ([100, 90, 80, 95, 30], [0, 2, 1, 0, 0]),
         (big, [999 - i for i in range(999)] + [0])]
for temps, expected in cases:
    check(Solution().dailyTemperatures(list(temps)), expected, str(temps[:8]))
