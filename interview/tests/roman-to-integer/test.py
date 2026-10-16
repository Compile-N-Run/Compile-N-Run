from solution import *


def to_roman(n):
    out = ''
    for v, sym in [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
                   (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v:
            out += sym
            n -= v
    return out


cases = [('LXXVIII', 78), ('CDXLIV', 444), ('MMXXVI', 2026), ('IX', 9), ('I', 1), ('MMMCMXCIX', 3999),
         ('MMMDCCCLXXXVIII', 3888), ('XLIX', 49)]
for s, expected in cases:
    check(Solution().romanToInt(s), expected, s)
for n in range(1, 4000):  # every valid numeral
    check(Solution().romanToInt(to_roman(n)), n, to_roman(n))
