from solution import *

big = "+".join(["7*3/2"] * 5000)  # 5000 terms of 10
cases = [("3+4*2", 11), (" 20 / 3 - 1 ", 5), ("8-6/4*3", 5), ("42", 42), ("3-5/2", 1), ("14-3/2", 13), ("1-1+1", 1),
         ("0*7", 0), ("2*3*4/5", 4), ("  2147483647 ", 2147483647), ("100 - 99 - 1", 0), (big, 50000)]
for s, expected in cases:
    check(Solution().calculate(s), expected, repr(s[:20]))
