from solution import *

cases = [
    (123, 321),
    (-450, -54),
    (1200, 21),
    (1534236469, 0),  # 9646324351 is too large
    (-2147483648, 0),  # INT_MIN: -8463847412 is too small
    (2147483647, 0),  # INT_MAX: 7463847412 is too large
    (1463847412, 2147483641),  # fits, 6 below INT_MAX
    (-1463847412, -2147483641),
    (0, 0),
    (7, 7),
    (-120, -21),
    (1000000000, 1),
    (1000000003, 0),  # 3000000001 is too large
    (2147447412, 2147447412),  # a palindrome that fits
    (-2147447412, -2147447412),
    (1056389759, 0),  # 9579836501 is too large
    (2147483641, 1463847412),
    (1234567899, 0),  # 9987654321 is too large
]
for x, expected in cases:
    check(Solution().reverse(x), expected, f'x={x}')
# every ten-digit value in a stretch: whatever fits must be reversed exactly, the rest must give 0
for x in range(1463847400, 1463847500):
    rev = int(str(x)[::-1])
    check(Solution().reverse(x), rev if rev <= 2**31 - 1 else 0, f'x={x}')
    check(Solution().reverse(-x), -rev if rev <= 2**31 - 1 else 0, f'x={-x}')
