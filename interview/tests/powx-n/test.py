from solution import *

# (x, n, expected); results are compared with a tolerance because rounding differs between methods.
cases = [
    (3.0, 4, 81.0),
    (2.0, -3, 0.125),
    (-1.5, 7, -17.0859375),
    (5.5, 0, 1.0),
    (2.0, -2147483648, 0.0),
    (2.0, 10, 1024.0),
    (2.1, 3, 9.261),
    (0.5, 3, 0.125),
    (0.0, 5, 0.0),
    (0.0, 0, 1.0),
    (1.0, 2147483647, 1.0),
    (-1.0, 2147483647, -1.0),
    (-1.0, -2147483648, 1.0),
    (2.0, -30, 9.313225746154785e-10),
    (1.5, 40, 11057332.320940012),
    (1.00001, 123456, 3.4368447520907104),
    (1.0000001, 2147483647, 1.8366448196907325e+93),
    (0.9999999, 2147483647, 5.444595237395887e-94),
]
for x, n, expected in cases:
    got = Solution().myPow(x, n)
    close = abs(got - expected) <= 1e-6 * max(1.0, abs(expected))
    check(close, True, f'myPow({x}, {n}): expected {expected}, got {got}')
