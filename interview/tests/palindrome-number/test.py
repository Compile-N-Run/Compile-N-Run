from solution import *

cases = [(1331, True), (12321, True), (-44, False), (50, False), (0, True), (7, True), (10, False), (1000021, False),
         (1000000001, True), (2147447412, True), (2147483647, False), (-2147483648, False)]
for x, expected in cases:
    check(Solution().isPalindrome(x), expected, str(x))
