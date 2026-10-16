from solution import *

cases = [(68, "LXVIII"), (944, "CMXLIV"), (2026, "MMXXVI"), (3999, "MMMCMXCIX"), (1, "I"), (4, "IV"), (9, "IX"),
         (40, "XL"), (1994, "MCMXCIV"), (3888, "MMMDCCCLXXXVIII")]
for num, expected in cases:
    check(Solution().intToRoman(num), expected, str(num))

# Larger case: every number in range, against an independent digit-by-digit table.
TH = ["", "M", "MM", "MMM"]
HU = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"]
TE = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"]
ON = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]
for n in range(1, 4000):
    check(Solution().intToRoman(n), TH[n // 1000] + HU[n // 100 % 10] + TE[n // 10 % 10] + ON[n % 10], str(n))
